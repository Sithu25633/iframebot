import * as cheerio from "cheerio";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

export interface MovieSearchResult {
  id: string;
  title: string;
  url: string;
  poster: string;
  rating?: string;
  year?: string;
  quality?: string;
  /** "movie" | "series" (episode pages are reached from the series page) */
  type?: "movie" | "series";
  category?: "movie" | "series" | "cartoon" | "anime-movie" | "anime-series" | string;
}

export interface SeriesEpisode {
  season: number;
  episode: number;
  title: string;
  url: string;
  thumb?: string;
  date?: string;
}

export interface MovieDetail {
  title: string;
  url: string;
  poster: string;
  backdrop: string;
  year?: string;
  quality?: string;
  imdbRating?: string;
  imdbVotes?: string;
  duration?: string;
  genres: string[];
  languages: string[];
  directors: string[];
  cast: { name: string; role?: string }[];
  tagline?: string;
  description: string;
  qualities: {
    label: string;
    meta: string;
    quality: string;
    sizeText?: string;
    language?: string;
    ztUrl: string;
  }[];
  /** "movie" (or episode), "series" (has episode list instead of qualities) */
  kind?: "movie" | "series" | "episode";
  /** Present on series pages */
  episodes?: SeriesEpisode[];
}

export async function fetchLatestMovies(page: number = 1): Promise<MovieSearchResult[]> {
  try {
    const url = page > 1 ? `https://cinesubz.lk/movies/page/${page}/` : "https://cinesubz.lk/movies/";
    const res = await fetch(url, {
      headers: { "User-Agent": UA },
      next: { revalidate: 3600 },
    });
    const html = await res.text();
    return parseMovieList(html);
  } catch (error) {
    console.error("Error fetching latest movies:", error);
    return [];
  }
}

export async function fetchLatestSeries(page: number = 1): Promise<MovieSearchResult[]> {
  try {
    const url = page > 1 ? `https://cinesubz.lk/tvshows/page/${page}/` : "https://cinesubz.lk/tvshows/";
    const res = await fetch(url, {
      headers: { "User-Agent": UA },
      next: { revalidate: 3600 },
    });
    const html = await res.text();
    return parseMovieList(html);
  } catch (error) {
    console.error("Error fetching latest TV series:", error);
    return [];
  }
}

export async function fetchGenreMovies(genre: string, page: number = 1): Promise<MovieSearchResult[]> {
  try {
    const cleanGenre = genre.toLowerCase().trim().replace(/[\s&]+/g, "-");
    const url =
      page > 1
        ? `https://cinesubz.lk/genre/${cleanGenre}/page/${page}/`
        : `https://cinesubz.lk/genre/${cleanGenre}/`;
    const res = await fetch(url, {
      headers: { "User-Agent": UA },
      next: { revalidate: 3600 },
    });
    const html = await res.text();
    return parseMovieList(html);
  } catch (error) {
    console.error(`Error fetching genre movies (${genre}):`, error);
    return [];
  }
}

export async function searchMovies(query: string): Promise<MovieSearchResult[]> {
  try {
    const res = await fetch(`https://cinesubz.lk/?s=${encodeURIComponent(query)}`, {
      headers: { "User-Agent": UA },
      cache: "no-store",
    });
    const html = await res.text();
    return parseMovieList(html);
  } catch (error) {
    console.error("Error searching movies:", error);
    return [];
  }
}

function parseMovieList(html: string): MovieSearchResult[] {
  const $ = cheerio.load(html);
  const movies: MovieSearchResult[] = [];
  const seen = new Set<string>();

  $(".display-item, .item-box, article, .item").each((_, el) => {
    const card = $(el);
    const linkEl = card.find('a[href*="/movies/"], a[href*="/tvshows/"]').first();
    let url = linkEl.attr("href");
    if (!url) {
      return;
    }
    url = url.replace(/cinesubz\.(net|co)/g, "cinesubz.lk");
    if (seen.has(url)) {
      return;
    }
    // Skip the bare listing pages (…/movies/, …/tvshows/)
    const bareListing = /^https?:\/\/[^/]+\/(movies|tvshows)\/?$/;
    if (bareListing.test(url)) {
      return;
    }
    seen.add(url);

    const isSeries = /\/tvshows\//.test(url);

    const imgEl = card.find("img").first();
    const poster =
      imgEl.attr("data-original") ||
      imgEl.attr("data-src") ||
      imgEl.attr("src") ||
      "";

    let title =
      card.find(".item-desc-title h3").text().trim() ||
      linkEl.attr("title")?.trim() ||
      card.find(".title a").text().trim() ||
      imgEl.attr("alt")?.trim() ||
      "Movie";

    const rating =
      card.find(".imdb-score").text().trim() ||
      card.find(".rating").text().trim() ||
      card.find(".imdb").text().trim() ||
      "";

    const quality =
      card
        .find(
          ".badge-quality-corner, .badge-season-corner, .badge-episode-corner, .quality"
        )
        .first()
        .text()
        .trim() || "HD";

    let year = "";
    const yearMatch = title.match(/\((\d{4})\)/);
    if (yearMatch) {
      year = yearMatch[1];
    } else {
      year = card.find(".year, .release-year").text().trim();
    }

    const id = url.replace(/\/+$/, "").split("/").pop() || Math.random().toString(36).substring(7);

    movies.push({
      id,
      title,
      url,
      poster,
      rating,
      year,
      quality,
      type: isSeries ? "series" : "movie",
    });
  });

  return movies;
}

export async function getMovieDetails(movieUrl: string): Promise<MovieDetail | null> {
  try {
    const res = await fetch(movieUrl, {
      headers: { "User-Agent": UA },
      next: { revalidate: 3600 },
    });
    const html = await res.text();
    const $ = cheerio.load(html);

    // Movies live under /movies/, series under /tvshows/, single episodes under /episodes/
    const kind: MovieDetail["kind"] = /\/tvshows\//.test(movieUrl)
      ? "series"
      : /\/episodes\//.test(movieUrl)
      ? "episode"
      : "movie";

    const title = $(".details-title").text().trim() || $("h1").first().text().trim() || "Movie";

    let year = "";
    const yearMatch = title.match(/\((\d{4})\)/);
    if (yearMatch) year = yearMatch[1];

    const poster =
      $(".poster-img img").attr("src") ||
      $('meta[property="og:image"]').attr("content") ||
      "";

    const backdrop =
      $(".splash-bg img").attr("src") ||
      $('meta[property="og:image"]').attr("content") ||
      poster;

    const quality = $(".data-quality").text().trim() || "HD";

    const imdbText = $(".data-imdb").text().trim();
    const imdbMatch = imdbText.match(/IMDb:\s*([\d.]+)/);
    const imdbRating = imdbMatch ? imdbMatch[1] : "";
    const votesMatch = imdbText.match(/\(([^)]+)\)/);
    const imdbVotes = votesMatch ? votesMatch[1] : "";

    const duration = $('span[itemprop="duration"]').text().trim() || "";

    const genres: string[] = [];
    $(".details-genre a").each((_, el) => {
      const g = $(el).text().trim();
      if (g && !g.startsWith(".")) genres.push(g);
    });

    const languages: string[] = [];
    $(".data-keywords-inline a").each((_, el) => {
      const l = $(el).text().trim();
      if (l) languages.push(l);
    });

    const directors: string[] = [];
    $('.info-col p:contains("Director") a, .info-col p:contains("directors") a').each((_, el) => {
      const d = $(el).text().trim();
      if (d) directors.push(d);
    });

    const cast: { name: string; role?: string }[] = [];
    $(".zt-cast-card").each((_, el) => {
      const name = $(el).find(".zt-cast-name").text().trim();
      const role = $(el).find(".zt-cast-role").text().trim();
      if (name) {
        cast.push({ name, role: role || undefined });
      }
    });

    const tagline = $(".tagline-text").text().trim() || "";
    const description = $(".details-desc").text().trim() || "";

    const qualities: MovieDetail["qualities"] = [];
    // Movie pages use movie-download-* classes; episode pages use plain download-*
    $(".movie-download-link-item, .download-link-item").each((_, el) => {
      const item = $(el);
      const a = item.find("a").first();
      const href = a.attr("href");
      if (!href) return;

      const label =
        item.find(".movie-download-type, .download-type").first().text().trim() ||
        "Download";
      const meta =
        item.find(".movie-download-meta, .download-meta").first().text().trim() || "";
      const bits = meta.split("•").map((s) => s.trim());

      const sizeMatch = meta.match(/([\d.]+\s*(?:GB|MB|TB|KB))/i);
      const sizeText = sizeMatch ? sizeMatch[0] : undefined;

      qualities.push({
        label,
        meta,
        quality: bits[0] || label,
        sizeText,
        language: bits.length > 2 ? bits[bits.length - 1] : undefined,
        ztUrl: href.startsWith("http") ? href : new URL(href, movieUrl).toString(),
      });
    });

    // Episode list for TV series pages (season containers + episode items)
    const episodes: SeriesEpisode[] = [];
    if (kind === "series") {
      $(".se-c, .season-list, .episodes-list").each((_, sec) => {
        const secEl = $(sec);
        let seasonNum = 1;
        const seText = secEl.find(".se-t, .season-title").first().text().trim();
        const sm = seText.match(/\d+/);
        if (sm) seasonNum = parseInt(sm[0], 10);
        else {
          const ds = secEl.attr("data-season");
          if (ds) seasonNum = parseInt(ds, 10);
        }

        secEl.find("li, .episode-item, a.episode-link").each((__, item) => {
          const itemEl = $(item);
          const a = itemEl.is("a") ? itemEl : itemEl.find("a").first();
          const href = a.attr("href");
          if (!href || (!href.includes("/episodes/") && !href.includes("/tv/"))) return;

          let epNum = episodes.length + 1;
          const numText = itemEl.find(".numerando, .ep-num").text().trim();
          const nm = numText.match(/(\d+)\s*[-xX×]\s*(\d+)/);
          if (nm) {
            seasonNum = parseInt(nm[1], 10);
            epNum = parseInt(nm[2], 10);
          } else {
            const nm2 = numText.match(/\d+/);
            if (nm2) epNum = parseInt(nm2[0], 10);
          }

          const epTitle =
            itemEl.find(".episodiotitle, .ep-title").text().trim() ||
            a.text().trim() ||
            `Episode ${epNum}`;
          const thumb = itemEl.find("img").attr("src");
          const date = itemEl.find(".date, .ep-date").text().trim();

          episodes.push({
            season: seasonNum,
            episode: epNum,
            title: epTitle,
            url: href.startsWith("http") ? href : new URL(href, movieUrl).toString(),
            thumb,
            date,
          });
        });
      });

      // Fallback: any direct episode links on page
      if (episodes.length === 0) {
        $('a[href*="/episodes/"]').each((_, a) => {
          const href = $(a).attr("href");
          if (!href) return;
          const text = $(a).text().trim();
          const m = href.match(/(\d+)[xX-](\d+)/);
          const s = m ? parseInt(m[1], 10) : 1;
          const e = m ? parseInt(m[2], 10) : episodes.length + 1;
          episodes.push({
            season: s,
            episode: e,
            title: text || `Episode ${e}`,
            url: href.startsWith("http") ? href : new URL(href, movieUrl).toString(),
          });
        });
      }

      episodes.sort((a, b) => a.season - b.season || a.episode - b.episode);
    }

    // Fallback if no specific download options parsed (series list their
    // downloads on the episode pages, not the series page)
    if (qualities.length === 0 && kind !== "series") {
      qualities.push(
        { label: "1080p Full HD", meta: "1080p • WEB-DL", quality: "1080p", ztUrl: movieUrl },
        { label: "720p HD", meta: "720p • WEB-DL", quality: "720p", ztUrl: movieUrl },
        { label: "480p SD", meta: "480p • WEB-DL", quality: "480p", ztUrl: movieUrl }
      );
    }

    return {
      title,
      url: movieUrl,
      poster,
      backdrop,
      year,
      quality,
      imdbRating,
      imdbVotes,
      duration,
      genres,
      languages,
      directors,
      cast,
      tagline,
      description,
      qualities,
      kind,
      ...(kind === "series" ? { episodes } : {}),
    };
  } catch (error) {
    console.error("Error getting movie details:", error);
    return null;
  }
}
