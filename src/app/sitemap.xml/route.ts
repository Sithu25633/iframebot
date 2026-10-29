import { NextResponse } from "next/server";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://web-umber-six-e1un7z6257.vercel.app";
const TMDB_KEY = process.env.TMDB_API_KEY || process.env.NEXT_PUBLIC_TMDB_API_KEY || "b6524bb48fb309af7e940a074a363851";

export const dynamic = "force-dynamic";

function toSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .trim();
}

async function fetchPageSlugs(): Promise<{ slug: string; type: "movie" | "tv"; updated: string }[]> {
  const endpoints: Array<{ path: string; type: "movie" | "tv" }> = [
    { path: "trending/movie/week",  type: "movie" },
    { path: "movie/popular",        type: "movie" },
    { path: "movie/top_rated",      type: "movie" },
    { path: "trending/tv/week",     type: "tv"    },
    { path: "tv/popular",           type: "tv"    },
    { path: "tv/top_rated",         type: "tv"    },
  ];

  const results: { slug: string; type: "movie" | "tv"; updated: string }[] = [];
  const seen = new Set<string>();

  for (const ep of endpoints) {
    try {
      const res = await fetch(
        `https://api.themoviedb.org/3/${ep.path}?api_key=${TMDB_KEY}&language=en-US&page=1`,
        { next: { revalidate: 86400 } }
      );
      if (res.ok) {
        const data = await res.json();
        for (const item of data.results ?? []) {
          const title = item.title ?? item.name ?? "";
          const slug  = toSlug(title);
          if (slug && !seen.has(slug)) {
            seen.add(slug);
            results.push({
              slug,
              type:    ep.type,
              updated: item.release_date ?? item.first_air_date ?? new Date().toISOString().slice(0, 10),
            });
          }
        }
      }
    } catch {
      // continue on error
    }
  }

  return results;
}

function sanitizeDate(rawDate: string | undefined | null, today: string): string {
  if (!rawDate || typeof rawDate !== "string") return today;
  const trimmed = rawDate.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return today;
  // Google Search Console rejects future dates in lastmod
  if (trimmed > today) return today;
  if (trimmed < "1970-01-01") return today;
  return trimmed;
}

function buildSitemap(
  items: { slug: string; type: string; updated: string }[],
  today: string
): string {
  const staticPages = [
    { loc: BASE_URL,                   lastmod: today, changefreq: "daily",   priority: "1.0" },
    { loc: `${BASE_URL}/movie`,        lastmod: today, changefreq: "daily",   priority: "0.9" },
    { loc: `${BASE_URL}/verify`,       lastmod: today, changefreq: "weekly",  priority: "0.7" },
  ];

  const dynamicUrls = items.map((item) => ({
    loc:        `${BASE_URL}/movie/${item.slug}`,
    lastmod:    sanitizeDate(item.updated, today),
    changefreq: "weekly",
    priority:   "0.8",
  }));

  const allUrls = [...staticPages, ...dynamicUrls];

  const urlElements = allUrls
    .map(
      (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlElements}
</urlset>`;
}

export async function GET() {
  const today = new Date().toISOString().slice(0, 10);
  const items = await fetchPageSlugs();
  const xml   = buildSitemap(items, today);

  return new NextResponse(xml, {
    status: 200,
    headers: {
      "Content-Type":  "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=43200",
    },
  });
}
