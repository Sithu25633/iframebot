import cartoonsRaw from "@/data/cartoons.json";
import { MovieSearchResult, MovieDetail } from "./cinesubz";

export interface CartoonItem {
  id: number | string;
  slug?: string;
  title: string;
  url: string;
  date?: string;
  categories: string[];
  tags?: string[];
  description?: string;
  poster?: string;
  download_links?: Array<{ quality?: string; url?: string; type?: string }>;
}

const cartoonsList: CartoonItem[] = (cartoonsRaw as any[]) || [];

function extractYear(title: string, date?: string): string {
  const match = title.match(/\((19\d\d|20\d\d)\)/) || title.match(/\b(19\d\d|20\d\d)\b/);
  if (match) return match[1];
  if (date) return date.split("-")[0];
  return "2024";
}

function cleanTitle(raw: string): { en: string; si?: string } {
  if (raw.includes("|")) {
    const parts = raw.split("|").map((p) => p.trim());
    return { en: parts[0], si: parts[1] };
  }
  return { en: raw.trim() };
}

export function cartoonToSearchResult(c: CartoonItem): MovieSearchResult {
  const titles = cleanTitle(c.title);
  return {
    id: `cartoon-${c.id}`,
    title: titles.en,
    url: c.url,
    poster: c.poster || "https://yt3.ggpht.com/2mgb7U29xiD32lXvFZM1Ml4-m50CBNDaS6mSo2DmFuEcffRvPXmaGkN5FVfMOvkhnJ-MErGT08qPxw=s320-nd-v1-rwa",
    year: extractYear(c.title, c.date),
    quality: "සිංහල Dubbed",
    type: "movie",
    category: "cartoon",
    rating: "8.9",
  };
}

export function getAllCartoons(limit = 40, page = 1, category?: string): { items: MovieSearchResult[]; total: number; totalPages: number } {
  let filtered = cartoonsList;
  if (category && category !== "All") {
    filtered = filtered.filter((c) =>
      c.categories.some((cat) => cat.toLowerCase() === category.toLowerCase())
    );
  }

  const start = (page - 1) * limit;
  const items = filtered.slice(start, start + limit).map(cartoonToSearchResult);

  return {
    items,
    total: filtered.length,
    totalPages: Math.ceil(filtered.length / limit),
  };
}

export function searchCartoons(query: string): MovieSearchResult[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];

  return cartoonsList
    .filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        (c.description && c.description.toLowerCase().includes(q)) ||
        c.categories.some((cat) => cat.toLowerCase().includes(q))
    )
    .map(cartoonToSearchResult);
}

export function getCartoonDetailsById(id: string): MovieDetail | null {
  const cleanId = id.replace(/^cartoon-/, "");
  const found = cartoonsList.find(
    (c) => String(c.id) === cleanId || c.slug === cleanId || c.url === cleanId
  );
  if (!found) return null;

  const titles = cleanTitle(found.title);

  return {
    title: titles.en,
    url: found.url,
    poster: found.poster || "https://yt3.ggpht.com/2mgb7U29xiD32lXvFZM1Ml4-m50CBNDaS6mSo2DmFuEcffRvPXmaGkN5FVfMOvkhnJ-MErGT08qPxw=s320-nd-v1-rwa",
    backdrop: found.poster || "",
    year: extractYear(found.title, found.date),
    quality: "සිංහල Dubbed",
    imdbRating: "8.9",
    duration: "1h 35m",
    genres: found.categories.length > 0 ? found.categories : ["Animation", "Sinhala Dubbed"],
    languages: ["සිංහල හඬකැවූ (Sinhala Dubbed)"],
    directors: ["Cartoons.lk Dubbing Official"],
    cast: [{ name: "සිංහල හඬකැවීම් ශිල්පීන්" }],
    tagline: titles.si || "Sinhala Dubbed Cartoon / Kids Movie",
    description: found.description || `${found.title} සිංහල හඬකැවූ චිත්‍රපටය FilmFeed ඔස්සේ දැන් නරඹන්න සහ ඩවුන්ලෝඩ් කරගන්න.`,
    qualities: [
      {
        label: "1080p Sinhala Dubbed (Direct High Speed)",
        meta: "Cartoons.lk Server • 1-Click Download",
        quality: "1080p",
        sizeText: "1.4 GB",
        language: "Sinhala Dubbed",
        ztUrl: found.url,
      },
      {
        label: "720p HD Sinhala Dubbed",
        meta: "Data Saver Recommended",
        quality: "720p",
        sizeText: "850 MB",
        language: "Sinhala Dubbed",
        ztUrl: found.url,
      },
    ],
    kind: "movie",
  };
}

export function findCartoonByUrl(url: string): CartoonItem | null {
  const found = cartoonsList.find(
    (c) => c.url === url || `cartoon-${c.id}` === url || String(c.id) === url || c.slug === url
  );
  return found || null;
}

export function cartoonToMovieDetail(item: CartoonItem, fallbackUrl?: string): MovieDetail {
  const detail = getCartoonDetailsById(String(item.id));
  if (detail) return detail;
  const titles = cleanTitle(item.title);
  return {
    title: titles.en,
    url: item.url || fallbackUrl || "",
    poster: item.poster || "https://yt3.ggpht.com/2mgb7U29xiD32lXvFZM1Ml4-m50CBNDaS6mSo2DmFuEcffRvPXmaGkN5FVfMOvkhnJ-MErGT08qPxw=s320-nd-v1-rwa",
    backdrop: item.poster || "",
    year: extractYear(item.title, item.date),
    quality: "සිංහල Dubbed",
    imdbRating: "8.9",
    duration: "1h 30m",
    genres: item.categories.length > 0 ? item.categories : ["Sinhala Dubbed", "Cartoons"],
    languages: ["සිංහල හඬකැවූ"],
    directors: ["Cartoons.lk Dubbing"],
    cast: [{ name: "සිංහල හඬකැවීම් ශිල්පීන්" }],
    tagline: titles.si || "Sinhala Dubbed Animation",
    description: item.description || item.title,
    qualities: [
      {
        label: "1080p Sinhala Dubbed (Direct Server)",
        meta: "Cartoons.lk Server",
        quality: "1080p",
        sizeText: "1.4 GB",
        language: "Sinhala Dubbed",
        ztUrl: item.url || fallbackUrl || "",
      },
    ],
    kind: "movie",
  };
}


