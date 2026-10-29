import { NextResponse } from "next/server";

const HOST = "web-umber-six-e1un7z6257.vercel.app";
const BASE_URL = `https://${HOST}`;
const INDEXNOW_KEY = "f8a92b3c4d5e6f708192a3b4c5d6e7f8";
const KEY_LOCATION = `${BASE_URL}/${INDEXNOW_KEY}.txt`;
const TMDB_KEY = process.env.TMDB_API_KEY || process.env.NEXT_PUBLIC_TMDB_API_KEY || "b6524bb48fb309af7e940a074a363851";

export const dynamic = "force-dynamic";

function toSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .trim();
}

async function collectUrls(): Promise<string[]> {
  const staticUrls = [
    BASE_URL,
    `${BASE_URL}/movie`,
    `${BASE_URL}/verify`,
  ];

  const endpoints = [
    "trending/movie/week",
    "movie/popular",
    "movie/top_rated",
    "trending/tv/week",
    "tv/popular",
    "tv/top_rated",
  ];

  const slugs = new Set<string>();

  for (const ep of endpoints) {
    try {
      const res = await fetch(
        `https://api.themoviedb.org/3/${ep}?api_key=${TMDB_KEY}&language=en-US&page=1`,
        { next: { revalidate: 3600 } }
      );
      if (res.ok) {
        const data = await res.json();
        for (const item of data.results ?? []) {
          const title = item.title ?? item.name ?? "";
          const slug = toSlug(title);
          if (slug) slugs.add(slug);
        }
      }
    } catch {
      // ignore individual fetch errors
    }
  }

  const movieUrls = Array.from(slugs).map((slug) => `${BASE_URL}/movie/${slug}`);
  return [...staticUrls, ...movieUrls];
}

async function submitToIndexNow(urls: string[]) {
  const payload = {
    host: HOST,
    key: INDEXNOW_KEY,
    keyLocation: KEY_LOCATION,
    urlList: urls,
  };

  const targets = [
    "https://api.indexnow.org/indexnow",
    "https://www.bing.com/indexnow",
  ];

  const results: Record<string, { status: number; text: string }> = {};

  for (const endpoint of targets) {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
        body: JSON.stringify(payload),
      });
      const text = await response.text();
      results[endpoint] = {
        status: response.status,
        text: text || (response.ok ? "Success / Accepted" : "Failed"),
      };
    } catch (e: any) {
      results[endpoint] = {
        status: 500,
        text: e?.message || "Network Error",
      };
    }
  }

  return results;
}

export async function GET() {
  try {
    const urls = await collectUrls();
    const results = await submitToIndexNow(urls);

    return NextResponse.json({
      success: true,
      submittedUrlsCount: urls.length,
      sampleUrls: urls.slice(0, 5),
      indexNowEndpoints: results,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Unknown error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    let urls = body.urls as string[] | undefined;

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      urls = await collectUrls();
    }

    const results = await submitToIndexNow(urls);

    return NextResponse.json({
      success: true,
      submittedUrlsCount: urls.length,
      indexNowEndpoints: results,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Unknown error" },
      { status: 500 }
    );
  }
}
