import * as cheerio from "cheerio";
import { MovieSearchResult, MovieDetail } from "./cinesubz";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

export async function searchSinhalaSub(query: string): Promise<MovieSearchResult[]> {
  try {
    const clean = query.replace(/[^\w\s]/g, " ").trim();
    if (!clean) return [];

    const url = `https://sinhalasub.lk/?s=${encodeURIComponent(clean)}`;
    const res = await fetch(url, {
      headers: { "User-Agent": UA },
      next: { revalidate: 1800 },
    });
    if (!res.ok) return [];

    const html = await res.text();
    const $ = cheerio.load(html);
    const results: MovieSearchResult[] = [];
    const seen = new Set<string>();

    $(".display-item, .item-box, article, .item").each((_, el) => {
      const card = $(el);
      const linkEl = card.find("a[href*='/movies/'], a[href*='/tvshows/']").first();
      let href = linkEl.attr("href")?.trim();
      if (!href) return;
      if (href.endsWith("/movies/") || href.endsWith("/tvshows/")) return;
      if (seen.has(href)) return;
      seen.add(href);

      const isSeries = href.includes("/tvshows/");
      const imgEl = card.find("img").first();
      const poster =
        imgEl.attr("data-src") ||
        imgEl.attr("data-original") ||
        imgEl.attr("src") ||
        "";

      let title =
        card.find(".item-desc-title h3").text().trim() ||
        linkEl.attr("title")?.trim() ||
        card.find("h3").text().trim() ||
        "Movie";

      const rating = card.find(".imdb-score, .rating, .imdb").text().trim();
      const quality = card.find(".badge-quality-corner, .quality").first().text().trim() || "HD";

      let year = "";
      const yearMatch = title.match(/\((\d{4})\)/);
      if (yearMatch) year = yearMatch[1];

      const id = href.replace(/\/+$/, "").split("/").pop() || Math.random().toString(36).substring(7);

      results.push({
        id: `sh-${id}`,
        title,
        url: href,
        poster,
        rating,
        year,
        quality,
        type: isSeries ? "series" : "movie",
        category: "sinhalasub",
      });
    });

    return results;
  } catch (err) {
    console.error("SinhalaSub search error:", err);
    return [];
  }
}

export async function getSinhalaSubMovieDetails(movieUrl: string): Promise<MovieDetail | null> {
  try {
    const res = await fetch(movieUrl, {
      headers: { "User-Agent": UA },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;

    const html = await res.text();
    const $ = cheerio.load(html);

    const kind: MovieDetail["kind"] = movieUrl.includes("/tvshows/")
      ? "series"
      : movieUrl.includes("/episodes/")
      ? "episode"
      : "movie";

    const title =
      $(".details-title h3").text().trim() ||
      $("h1").first().text().trim() ||
      "Movie";

    let year = "";
    const yearMatch = title.match(/\((\d{4})\)/);
    if (yearMatch) year = yearMatch[1];

    let poster =
      $("img.poster-img").attr("src") ||
      $('meta[property="og:image"]').attr("content") ||
      "";
    if (poster) {
      poster = poster.replace(/\/t\/p\/w\d+\//, "/t/p/w780/");
    }
    const backdrop = poster;

    const quality = $(".data-quality").text().trim() || "HD";
    const imdbText = $(".data-imdb").text().trim();
    const imdbMatch = imdbText.match(/IMDb:\s*([\d.]+)/);
    const imdbRating = imdbMatch ? imdbMatch[1] : "";

    const duration = $('span[itemprop="duration"]').text().trim() || "";

    const genres: string[] = [];
    $('.sgeneros a, a[href*="/genre/"]').each((_, a) => {
      const g = $(a).text().trim();
      if (g && !genres.includes(g)) genres.push(g);
    });

    const description = $(".details-desc").text().trim() || $('meta[name="description"]').attr("content") || "";

    // Parse download options
    const qualities: MovieDetail["qualities"] = [];
    const seenQualities = new Set<string>();

    $("#links table.links-table tbody tr").each((_, tr) => {
      const row = $(tr);
      const a = row.find(".link-opt a[href], a[href*='/links/']").first();
      const href = a.attr("href");
      if (!href) return;

      const qText = row.find("span.quality").text().trim() || row.find("td").eq(1).text().trim() || "HD 720p";
      const sizeText = row.find("td").last().text().trim() || "";

      // Deduplicate identical quality labels (pick the first working mirror)
      const qKey = qText.toUpperCase();
      if (!seenQualities.has(qKey)) {
        seenQualities.add(qKey);
        qualities.push({
          label: `${qText} ${sizeText ? `(${sizeText})` : ""}`.trim(),
          meta: `SinhalaSub.LK • ${qText} • ${sizeText}`,
          quality: qText.replace(/FHD|HD|SD/gi, "").trim() || qText,
          sizeText: sizeText || undefined,
          language: "Sinhala Subtitles",
          ztUrl: href.startsWith("http") ? href : `https://sinhalasub.lk${href}`,
        });
      }
    });

    if (qualities.length === 0) {
      qualities.push(
        { label: "1080p FHD", meta: "SinhalaSub • 1080p", quality: "1080p", ztUrl: movieUrl },
        { label: "720p HD", meta: "SinhalaSub • 720p", quality: "720p", ztUrl: movieUrl },
        { label: "480p SD", meta: "SinhalaSub • 480p", quality: "480p", ztUrl: movieUrl }
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
      duration,
      genres: genres.length > 0 ? genres : ["Action", "Sinhala Subtitles"],
      languages: ["Sinhala Subtitles"],
      directors: ["SinhalaSub.LK"],
      cast: [],
      tagline: `${title} - Sinhala Subtitles`,
      description,
      qualities,
      kind,
    };
  } catch (err) {
    console.error("Error getting SinhalaSub details:", err);
    return null;
  }
}
