import type { Metadata } from "next";
import { notFound } from "next/navigation";

const BASE_URL  = process.env.NEXT_PUBLIC_SITE_URL ?? "https://web-umber-six-e1un7z6257.vercel.app";
const TMDB_KEY  = process.env.TMDB_API_KEY || process.env.NEXT_PUBLIC_TMDB_API_KEY || "b6524bb48fb309af7e940a074a363851";
const IMG_BASE  = "https://image.tmdb.org/t/p/original";
const IMG_W500  = "https://image.tmdb.org/t/p/w500";

export const dynamicParams = true;
export const revalidate = 86400; // 24 hours ISR caching

import { StreamPlayer, SeasonInfo } from "@/components/StreamPlayer";

interface Genre    { id: number; name: string }
interface CastMember { name: string; character: string; profile_path: string | null }

interface MovieData {
  id:                 number;
  title:              string;
  slug:               string;
  overview:           string;
  release_date:       string;
  runtime:            number;
  vote_average:       number;
  vote_count:         number;
  popularity:         number;
  poster_path:        string | null;
  backdrop_path:      string | null;
  genres:             Genre[];
  cast:               CastMember[];
  tagline:            string;
  type:               "movie" | "tv";
  number_of_seasons?: number;
  seasons?:           SeasonInfo[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .trim();
}

async function fetchMovieBySlug(slug: string): Promise<MovieData | null> {
  const query = slug.replace(/-/g, " ");

  try {
    const searchRes = await fetch(
      `https://api.themoviedb.org/3/search/multi?api_key=${TMDB_KEY}&query=${encodeURIComponent(query)}&language=en-US`,
      { next: { revalidate: 86400 } }
    );

    if (!searchRes.ok) return null;
    const searchData = await searchRes.json();
    const results: any[] = searchData.results ?? [];
    const mediaResults = results.filter(
      (r) => r.media_type === "movie" || r.media_type === "tv"
    );

    const match =
      mediaResults.find((r) => toSlug(r.title ?? r.name ?? "") === slug) ??
      mediaResults[0];

    if (!match) return null;

    const type      = match.media_type === "tv" ? "tv" : "movie";
    const detailRes = await fetch(
      `https://api.themoviedb.org/3/${type}/${match.id}?api_key=${TMDB_KEY}&language=en-US&append_to_response=credits`,
      { next: { revalidate: 86400 } }
    );

    if (!detailRes.ok) return null;
    const detail = await detailRes.json();

    const cast: CastMember[] = (detail.credits?.cast ?? [])
      .slice(0, 12)
      .map((c: any) => ({ name: c.name, character: c.character, profile_path: c.profile_path }));

    return {
      id:            detail.id,
      title:         detail.title ?? detail.name ?? "",
      slug:          toSlug(detail.title ?? detail.name ?? ""),
      overview:      detail.overview ?? "",
      release_date:  detail.release_date ?? detail.first_air_date ?? "",
      runtime:       detail.runtime ?? detail.episode_run_time?.[0] ?? 0,
      vote_average:  detail.vote_average ?? 0,
      vote_count:    detail.vote_count ?? 0,
      popularity:    detail.popularity ?? 0,
      poster_path:   detail.poster_path,
      backdrop_path: detail.backdrop_path,
      genres:        detail.genres ?? [],
      cast,
      tagline:           detail.tagline ?? "",
      type,
      number_of_seasons: detail.number_of_seasons ?? (type === "tv" ? 1 : undefined),
      seasons:           detail.seasons
        ? detail.seasons
            .filter((s: any) => s.season_number > 0)
            .map((s: any) => ({
              season_number: s.season_number,
              episode_count: s.episode_count ?? 12,
              name:          s.name,
            }))
        : undefined,
    };
  } catch {
    return null;
  }
}

// ─── Static Params ────────────────────────────────────────────────────────────

export async function generateStaticParams() {
  const slugs: { slug: string }[] = [];
  const seen = new Set<string>();

  const endpoints = [
    `https://api.themoviedb.org/3/trending/movie/week?api_key=${TMDB_KEY}&language=en-US&page=1`,
    `https://api.themoviedb.org/3/trending/tv/week?api_key=${TMDB_KEY}&language=en-US&page=1`,
  ];

  for (const ep of endpoints) {
    try {
      const res = await fetch(ep, { next: { revalidate: 86400 } });
      if (res.ok) {
        const data = await res.json();
        for (const item of (data.results ?? []).slice(0, 15)) {
          const slug = toSlug(item.title ?? item.name ?? "");
          if (slug && !seen.has(slug)) {
            seen.add(slug);
            slugs.push({ slug });
          }
        }
      }
    } catch {
      // fallback
    }
  }
  return slugs;
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const movie = await fetchMovieBySlug(params.slug);
  if (!movie) return { title: "Movie Not Found | FilmFeed 4K" };

  const year  = movie.release_date?.slice(0, 4) ?? "";
  const genre = movie.genres[0]?.name ?? "Movie";

  return {
    title:       `Watch ${movie.title} (${year}) Free in 4K | FilmFeed Cinema`,
    description: `Stream ${movie.title} online free in 4K HD. No sign-up required. ${movie.overview.slice(0, 140)}`,
    keywords:    [
      `watch ${movie.title} free`,
      `${movie.title} full movie`,
      `${movie.title} online`,
      `stream ${movie.title}`,
      `${movie.title} 4K`,
      `${movie.title} ${year}`,
      genre,
    ],
    openGraph: {
      title:       `${movie.title} — Watch Free in 4K`,
      description: movie.overview.slice(0, 200),
      images:      movie.poster_path ? [`${IMG_W500}${movie.poster_path}`] : [],
      type:        "video.movie",
      url:         `${BASE_URL}/movie/${movie.slug}`,
    },
    twitter: {
      card:        "summary_large_image",
      title:       `${movie.title} — Stream Free 4K`,
      description: movie.overview.slice(0, 200),
      images:      movie.poster_path ? [`${IMG_W500}${movie.poster_path}`] : [],
    },
    alternates: {
      canonical: `${BASE_URL}/movie/${movie.slug}`,
    },
  };
}

// ─── JSON-LD Structured Data ──────────────────────────────────────────────────

function JsonLD({ movie }: { movie: MovieData }) {
  const schema = {
    "@context":    "https://schema.org",
    "@type":       "Movie",
    name:          movie.title,
    description:   movie.overview,
    image:         movie.poster_path ? `${IMG_BASE}${movie.poster_path}` : undefined,
    datePublished: movie.release_date,
    genre:         movie.genres.map((g) => g.name),
    duration:      movie.runtime ? `PT${movie.runtime}M` : undefined,
    aggregateRating: movie.vote_count > 0 ? {
      "@type":       "AggregateRating",
      ratingValue:   movie.vote_average.toFixed(1),
      bestRating:    "10",
      worstRating:   "1",
      ratingCount:   movie.vote_count,
    } : undefined,
    actor: movie.cast.map((c) => ({ "@type": "Person", name: c.name })),
    url:   `${BASE_URL}/movie/${movie.slug}`,
    potentialAction: {
      "@type":  "WatchAction",
      target:   `${BASE_URL}/movie/${movie.slug}`,
    },
  };

  const videoSchema = {
    "@context":    "https://schema.org",
    "@type":       "VideoObject",
    name:          `${movie.title} — Full Movie Stream`,
    description:   movie.overview,
    thumbnailUrl:  movie.backdrop_path ? `${IMG_BASE}${movie.backdrop_path}` : undefined,
    uploadDate:    movie.release_date,
    embedUrl:      `${BASE_URL}/movie/${movie.slug}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(videoSchema) }}
      />
    </>
  );
}

// ─── Page Component ───────────────────────────────────────────────────────────

export default async function MoviePage({ params }: { params: { slug: string } }) {
  const movie = await fetchMovieBySlug(params.slug);
  if (!movie) notFound();

  const year     = movie.release_date?.slice(0, 4) ?? "";
  const rating   = movie.vote_average.toFixed(1);
  const backdrop = movie.backdrop_path ? `${IMG_BASE}${movie.backdrop_path}` : null;
  const poster   = movie.poster_path   ? `${IMG_W500}${movie.poster_path}`   : null;

  return (
    <div className="bg-black text-white min-h-screen">
      <JsonLD movie={movie} />

      {/* Hero Section */}
      <section
        className="relative min-h-[70vh] flex items-end pb-12"
        style={{
          backgroundImage:    backdrop ? `url(${backdrop})` : "none",
          backgroundSize:     "cover",
          backgroundPosition: "center top",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />

        <div className="relative z-10 container mx-auto px-4 flex flex-col md:flex-row gap-8 items-end">
          {poster && (
            <img
              src={poster}
              alt={`${movie.title} poster`}
              className="hidden md:block w-52 rounded-2xl shadow-2xl border border-white/10 flex-shrink-0"
              loading="eager"
            />
          )}

          <div className="flex-1">
            <div className="flex flex-wrap gap-2 mb-3">
              {movie.genres.map((g) => (
                <span
                  key={g.id}
                  className="px-3 py-1 text-xs font-semibold rounded-full bg-red-600/90 text-white uppercase tracking-wider"
                >
                  {g.name}
                </span>
              ))}
            </div>

            <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight mb-2 drop-shadow-lg">
              {movie.title}
            </h1>

            {movie.tagline && (
              <p className="text-gray-300 italic text-lg mb-3">"{movie.tagline}"</p>
            )}

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300 mb-4">
              {year && <span className="font-medium bg-white/10 px-2 py-0.5 rounded">{year}</span>}
              {movie.runtime > 0 && (
                <span>{Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m</span>
              )}
              <span className="flex items-center gap-1 text-yellow-400 font-bold">
                ⭐ {rating} / 10
              </span>
              <span className="text-gray-500">({movie.vote_count.toLocaleString()} votes)</span>
            </div>

            <p className="text-gray-200 text-base leading-relaxed max-w-2xl mb-8 line-clamp-3">
              {movie.overview}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4">
              <a
                href="#watch-player"
                className="inline-flex items-center gap-2 px-8 py-4 bg-red-600 hover:bg-red-500 text-white font-bold text-lg rounded-xl shadow-lg shadow-red-900/50 transition-all duration-200 hover:scale-105"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                Watch Stream in 4K
              </a>
              <a
                href={`https://wa.me/${"94760372547"}?text=${encodeURIComponent(`${movie.type === "tv" ? "!req_series" : "!req"} ${movie.title} | 1080p | DIRECT`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-4 bg-green-600 hover:bg-green-500 text-white font-bold text-base rounded-xl transition-all duration-200 hover:scale-105"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
                Request 4K File on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Online 4K Video Player */}
      <section className="container mx-auto px-4 -mt-4 relative z-20">
        <StreamPlayer
          tmdbId={movie.id}
          title={movie.title}
          type={movie.type}
          backdrop={backdrop}
          poster={poster}
          numberOfSeasons={movie.number_of_seasons}
          seasons={movie.seasons}
        />
      </section>

      {/* Details Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Synopsis */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-white mb-4 border-b border-white/10 pb-3">
              Synopsis & Storyline
            </h2>
            <p className="text-gray-300 leading-relaxed text-base">{movie.overview}</p>

            {/* Quality Badges */}
            <div className="mt-6 flex flex-wrap gap-3">
              {["4K UHD Quality", "1080p Full HD", "Direct High-Speed", "Zero Popups", "Sinhala & English Audio"].map((tag) => (
                <span
                  key={tag}
                  className="px-4 py-2 bg-white/5 border border-white/10 text-gray-300 text-sm rounded-lg font-medium"
                >
                  ✓ {tag}
                </span>
              ))}
            </div>

            {/* Cast */}
            {movie.cast.length > 0 && (
              <div className="mt-10">
                <h2 className="text-2xl font-bold text-white mb-6 border-b border-white/10 pb-3">
                  Top Cast
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {movie.cast.map((member) => (
                    <div key={member.name} className="text-center">
                      {member.profile_path ? (
                        <img
                          src={`https://image.tmdb.org/t/p/w185${member.profile_path}`}
                          alt={member.name}
                          className="w-16 h-16 rounded-full object-cover mx-auto mb-2 border-2 border-white/10"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-white/10 mx-auto mb-2 flex items-center justify-center text-2xl">
                          👤
                        </div>
                      )}
                      <p className="text-white text-sm font-semibold leading-tight">{member.name}</p>
                      <p className="text-gray-500 text-xs truncate">{member.character}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Movie Info</h3>
              <dl className="space-y-3 text-sm">
                {year && (
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Release Year</dt>
                    <dd className="text-gray-200 font-medium">{year}</dd>
                  </div>
                )}
                {movie.runtime > 0 && (
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Runtime</dt>
                    <dd className="text-gray-200 font-medium">
                      {Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m
                    </dd>
                  </div>
                )}
                {movie.genres.length > 0 && (
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Genres</dt>
                    <dd className="text-gray-200 font-medium text-right">
                      {movie.genres.map((g) => g.name).join(", ")}
                    </dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-gray-500">TMDb Rating</dt>
                  <dd className="text-yellow-400 font-bold">{rating} / 10</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Stream Availability</dt>
                  <dd className="text-green-400 font-bold">4K UHD / 1080p</dd>
                </div>
              </dl>
            </div>

            <a
              href="#watch-player"
              className="block w-full text-center px-6 py-4 bg-gradient-to-r from-red-600 to-red-500 text-white font-bold text-lg rounded-xl shadow-lg hover:from-red-500 hover:to-red-400 transition-all duration-200 hover:scale-102"
            >
              ▶ Stream Now in 4K
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
