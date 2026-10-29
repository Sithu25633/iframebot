import animeMoviesRaw from "@/data/animekaizen_movies.json";
import animeSeriesRaw from "@/data/animekaizen_series.json";
import animeClubMoviesRaw from "@/data/animeclub_movies.json";
import animeClubSeriesRaw from "@/data/animeclub_series.json";
import { MovieSearchResult, MovieDetail, SeriesEpisode } from "./cinesubz";

export interface AnimeDownloadLink {
  text: string;
  url: string;
  type?: string;
}

export interface AnimeDownloadCard {
  title?: string;
  season?: string;
  quality?: string;
  links: AnimeDownloadLink[];
}

export interface AnimeItem {
  id: number | string;
  title: string;
  url: string;
  date?: string;
  categories: string[];
  badges: string[];
  quality?: string;
  rating?: string;
  genres: string[];
  info?: string;
  description: string;
  poster: string;
  backdrop?: string;
  download_links: AnimeDownloadLink[];
  download_cards?: AnimeDownloadCard[];
}

const animeMoviesList: AnimeItem[] = [
  ...((animeClubMoviesRaw as any[]) || []),
  ...((animeMoviesRaw as any[]) || []),
];

const animeSeriesList: AnimeItem[] = [
  ...((animeClubSeriesRaw as any[]) || []),
  ...((animeSeriesRaw as any[]) || []),
];

export function getAnimeMovies(limit = 40, page = 1, genre?: string): { items: MovieSearchResult[]; total: number; totalPages: number } {
  let filtered = animeMoviesList;
  if (genre && genre !== "All") {
    filtered = filtered.filter((a) =>
      a.categories.some((c) => c.toLowerCase() === genre.toLowerCase()) ||
      a.genres.some((g) => g.toLowerCase() === genre.toLowerCase())
    );
  }

  const start = (page - 1) * limit;
  const items = filtered.slice(start, start + limit).map((a) => ({
    id: `anime-movie-${a.id}`,
    title: a.title,
    url: a.url,
    poster: a.poster || a.backdrop || "https://placehold.co/400x600/18181b/f43f5e?text=Anime+Movie",
    year: a.date ? a.date.split("-")[0] : "2024",
    quality: a.quality || "1080p FHD",
    type: "movie" as const,
    category: "anime",
    rating: a.rating ? a.rating : "8.8",
  }));

  return {
    items,
    total: filtered.length,
    totalPages: Math.ceil(filtered.length / limit),
  };
}

export function getAnimeSeries(limit = 40, page = 1, genre?: string): { items: MovieSearchResult[]; total: number; totalPages: number } {
  let filtered = animeSeriesList;
  if (genre && genre !== "All") {
    filtered = filtered.filter((a) =>
      a.categories.some((c) => c.toLowerCase() === genre.toLowerCase()) ||
      a.genres.some((g) => g.toLowerCase() === genre.toLowerCase())
    );
  }

  const start = (page - 1) * limit;
  const items = filtered.slice(start, start + limit).map((a) => ({
    id: `anime-series-${a.id}`,
    title: a.title,
    url: a.url,
    poster: a.poster || a.backdrop || "https://placehold.co/400x600/18181b/f43f5e?text=Anime+Series",
    year: a.date ? a.date.split("-")[0] : "2024",
    quality: a.quality || "1080p FHD",
    type: "series" as const,
    category: "anime-series",
    rating: a.rating ? a.rating : "8.9",
  }));

  return {
    items,
    total: filtered.length,
    totalPages: Math.ceil(filtered.length / limit),
  };
}

export function searchAnime(query: string, type: "movies" | "series" | "all" = "all"): MovieSearchResult[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];

  const pool =
    type === "movies"
      ? animeMoviesList
      : type === "series"
      ? animeSeriesList
      : [...animeMoviesList, ...animeSeriesList];

  return pool
    .filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        (a.description && a.description.toLowerCase().includes(q)) ||
        a.categories.some((c) => c.toLowerCase().includes(q))
    )
    .slice(0, 50)
    .map((a) => ({
      id: `anime-${a.download_cards && a.download_cards.length > 0 ? "series" : "movie"}-${a.id}`,
      title: a.title,
      url: a.url,
      poster: a.poster || a.backdrop || "https://placehold.co/400x600/18181b/f43f5e?text=Anime",
      year: a.date ? a.date.split("-")[0] : "2024",
      quality: a.quality || "1080p",
      type: (a.download_cards && a.download_cards.length > 0 ? "series" : "movie") as "series" | "movie",
      category: a.download_cards && a.download_cards.length > 0 ? "anime-series" : "anime",
      rating: a.rating || "8.8",
    }));
}

export function getAnimeDetailsById(id: string): MovieDetail | null {
  const cleanId = id.replace(/^(anime-movie-|anime-series-|anime-)/, "");
  const found =
    animeMoviesList.find((a) => String(a.id) === cleanId) ||
    animeSeriesList.find((a) => String(a.id) === cleanId);

  if (!found) return null;

  const isSeries = Boolean(found.download_cards && found.download_cards.length > 0);

  const episodes: SeriesEpisode[] = [];
  if (isSeries && found.download_cards) {
    found.download_cards.forEach((card: any, cIdx: number) => {
      const cardTitle = card.card_title || card.title || `Part ${cIdx + 1}`;
      const seasonNum = parseInt(card.season || String(cIdx + 1), 10) || (cIdx + 1);
      const links = card.links || [];
      links.forEach((link: any, lIdx: number) => {
        const linkLabel = link.label || link.text || `Episode ${lIdx + 1}`;
        episodes.push({
          season: seasonNum,
          episode: lIdx + 1,
          title: linkLabel.startsWith("Episode") ? linkLabel : `${cardTitle} - ${linkLabel}`,
          url: link.url || found.url,
          date: found.date || "2024",
        });
      });
    });
  }

  // Parse direct qualities
  const qualitiesList: Array<{
    label: string;
    meta: string;
    quality: string;
    sizeText?: string;
    language?: string;
    ztUrl: string;
  }> = [];

  if (found.download_links && found.download_links.length > 0) {
    found.download_links.forEach((link: any) => {
      const label = link.label || link.text || "Direct Download";
      qualitiesList.push({
        label: `${label} (Direct Drive)`,
        meta: "High Speed Google Drive • Instant Download",
        quality: label.includes("720") ? "720p" : "1080p",
        sizeText: "1.2 GB",
        language: "Japanese (English / Sinhala Sub)",
        ztUrl: link.url,
      });
    });
  }

  if (qualitiesList.length === 0) {
    qualitiesList.push({
      label: "1080p FHD Direct Download",
      meta: "High Speed Google Drive",
      quality: "1080p",
      sizeText: "1.2 GB",
      language: "Japanese (Subbed)",
      ztUrl: found.url,
    });
  }

  return {
    title: found.title,
    url: found.url,
    poster: found.poster || found.backdrop || "https://placehold.co/400x600/18181b/f43f5e?text=Anime",
    backdrop: found.backdrop || found.poster || "",
    year: found.date ? found.date.split("-")[0] : "2026",
    quality: found.quality || "1080p FHD",
    imdbRating: found.rating ? found.rating.replace("/10", "") : "8.8",
    duration: isSeries ? "24m / ep" : "1h 45m",
    genres: found.categories && found.categories.length > 0 ? found.categories : ["Anime", "Action"],
    languages: found.badges || ["Japanese (Subbed)"],
    directors: ["Anime Studio"],
    cast: [{ name: "Original Japanese Cast" }],
    tagline: found.badges.join(" • ") || "AnimeKaizen HD Edition",
    description: found.description || `${found.title} full high quality 1080p release.`,
    qualities: qualitiesList,
    kind: isSeries ? "series" : "movie",
    episodes: episodes.length > 0 ? episodes : undefined,
  };
}

export function findAnimeByUrl(url: string): { type: "movie" | "series"; item: AnimeItem } | null {
  const movie = animeMoviesList.find((a) => a.url === url || `anime-movie-${a.id}` === url || `anime-${a.id}` === url);
  if (movie) return { type: "movie", item: movie };

  const series = animeSeriesList.find((a) => a.url === url || `anime-series-${a.id}` === url || `anime-${a.id}` === url);
  if (series) return { type: "series", item: series };

  return null;
}

export function animeMovieToMovieDetail(item: AnimeItem): MovieDetail {
  return getAnimeDetailsById(`anime-movie-${item.id}`)!;
}

export function animeSeriesToMovieDetail(item: AnimeItem): MovieDetail {
  return getAnimeDetailsById(`anime-series-${item.id}`)!;
}
