import baiscopesRaw from "@/data/baiscopes_movies.json";
import { MovieSearchResult, MovieDetail } from "./cinesubz";

export interface BaiscopesDownloadLink {
  label: string;
  size?: string;
  intermediate_url: string;
  direct_url?: string;
}

export interface BaiscopesItem {
  id: string;
  title: string;
  url: string;
  poster?: string;
  year?: string;
  quality?: string;
  genres: string[];
  language?: string;
  country?: string;
  date?: string;
  description?: string;
  download_links: BaiscopesDownloadLink[];
}

const baiscopesList: BaiscopesItem[] = (baiscopesRaw as BaiscopesItem[]) || [];

function baiscopesToSearchResult(item: BaiscopesItem): MovieSearchResult {
  return {
    id: item.id,
    title: item.title,
    url: item.url,
    poster:
      item.poster ||
      "https://placehold.co/400x600/18181b/f43f5e?text=Baiscopes",
    year: item.year || "2025",
    quality: item.quality || "HD",
    type: "movie" as const,
    category: "baiscopes",
    rating: "8.5",
  };
}

export function getBaiscopesMovies(
  limit = 24,
  page = 1,
  genre?: string,
  language?: string,
  country?: string
): { items: MovieSearchResult[]; total: number; totalPages: number } {
  let filtered = baiscopesList;

  if (genre && genre !== "All") {
    filtered = filtered.filter((item) =>
      item.genres.some((g) => g.toLowerCase() === genre.toLowerCase())
    );
  }

  if (language && language !== "All") {
    filtered = filtered.filter(
      (item) =>
        item.language &&
        item.language.toLowerCase() === language.toLowerCase()
    );
  }

  if (country && country !== "All") {
    filtered = filtered.filter(
      (item) =>
        item.country &&
        item.country.toLowerCase() === country.toLowerCase()
    );
  }

  const start = (page - 1) * limit;
  const items = filtered
    .slice(start, start + limit)
    .map(baiscopesToSearchResult);

  return {
    items,
    total: filtered.length,
    totalPages: Math.ceil(filtered.length / limit),
  };
}

export function searchBaiscopes(query: string): MovieSearchResult[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];

  return baiscopesList
    .filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        (item.description && item.description.toLowerCase().includes(q)) ||
        item.genres.some((g) => g.toLowerCase().includes(q))
    )
    .slice(0, 50)
    .map(baiscopesToSearchResult);
}

export function getBaiscopesDetailsById(id: string): MovieDetail | null {
  const found =
    baiscopesList.find((item) => item.id === id) ||
    baiscopesList.find((item) => item.url === id);

  if (!found) return null;

  const qualities: MovieDetail["qualities"] = found.download_links.map(
    (dl, idx) => ({
      label: dl.size
        ? `Download ${idx + 1} (${dl.size})`
        : `Download ${idx + 1}`,
      meta: `Baiscopes.lk • ${found.quality || "HD"} • Direct Download`,
      quality: found.quality || "HD",
      sizeText: dl.size || undefined,
      language: found.language || "Sinhala",
      // Use direct_url first, then intermediate_url — NEVER the movie page URL
      ztUrl: dl.direct_url || dl.intermediate_url,
    })
  );

  // No download links — show the page URL so bot can try to scrape it live
  // but mark it clearly so UI can warn the user
  if (qualities.length === 0) {
    qualities.push({
      label: `View on Baiscopes.lk`,
      meta: "⚠️ No direct download link available yet — check baiscopes.lk",
      quality: found.quality || "HD",
      language: found.language || "Sinhala",
      ztUrl: "", // empty — UI will disable the request button
    });
  }

  return {
    title: found.title,
    url: found.url,
    poster:
      found.poster ||
      "https://placehold.co/400x600/18181b/f43f5e?text=Baiscopes",
    backdrop:
      found.poster ||
      "https://placehold.co/400x600/18181b/f43f5e?text=Baiscopes",
    year: found.year || "2025",
    quality: found.quality || "HD",
    imdbRating: "8.5",
    duration: "1h 45m",
    genres:
      found.genres.length > 0 ? found.genres : ["Drama", "Sinhala"],
    languages: [found.language || "Sinhala"],
    directors: ["Baiscopes.lk"],
    cast: [{ name: "Cast information not available" }],
    tagline: `${found.language || "Sinhala"} ${found.quality || "HD"} — Baiscopes.lk`,
    description:
      found.description ||
      `${found.title} — Watch and download via Baiscopes.lk.`,
    qualities,
    kind: "movie",
  };
}

export function findBaiscopesByUrl(url: string): BaiscopesItem | null {
  return (
    baiscopesList.find(
      (item) => item.url === url || item.id === url
    ) || null
  );
}

export function getBaiscopesFilters(): {
  genres: string[];
  languages: string[];
  countries: string[];
} {
  const genreSet = new Set<string>();
  const languageSet = new Set<string>();
  const countrySet = new Set<string>();

  for (const item of baiscopesList) {
    if (item.genres) {
      for (const g of item.genres) {
        if (g && g.trim()) genreSet.add(g.trim());
      }
    }
    if (item.language && item.language.trim()) {
      languageSet.add(item.language.trim());
    }
    if (item.country && item.country.trim()) {
      countrySet.add(item.country.trim());
    }
  }

  return {
    genres: Array.from(genreSet).sort(),
    languages: Array.from(languageSet).sort(),
    countries: Array.from(countrySet).sort(),
  };
}
