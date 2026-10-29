"use client";

import React from "react";
import Link from "next/link";
import { Star, Play, Film, Tv } from "lucide-react";
import { MovieSearchResult } from "@/lib/cinesubz";

interface MovieCardProps {
  movie: MovieSearchResult;
}

export const MovieCard: React.FC<MovieCardProps> = ({ movie }) => {
  const [imgSrc, setImgSrc] = React.useState<string>(movie.poster || "");
  const [hasError, setHasError] = React.useState(false);

  React.useEffect(() => {
    setImgSrc(movie.poster || "");
    setHasError(false);
  }, [movie.poster]);

  const isSeries =
    movie.type === "series" ||
    (movie.url && movie.url.includes("/tvshows/")) ||
    movie.category === "series";

  // Clean title
  const cleanTitle =
    movie.title
      .replace(/\s*\(?\d{4}\)?\s*Sinhala.*$/i, "")
      .replace(/\|\s*සිංහල.*$/i, "")
      .trim() || movie.title;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-white/[0.07] bg-[#11131a] transition-all duration-300 hover:border-emerald-500/40 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-950/20">
      <Link
        href={`/movie?url=${encodeURIComponent(movie.url)}`}
        className="relative aspect-[2/3] w-full overflow-hidden bg-[#0a0c12]"
      >
        {imgSrc && !hasError ? (
          <img
            src={imgSrc}
            alt={cleanTitle}
            referrerPolicy="no-referrer"
            onError={() => {
              setHasError(true);
            }}
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center p-4 text-center bg-gradient-to-b from-[#181b24] to-[#0e1017] text-gray-400">
            {isSeries ? (
              <Tv className="h-8 w-8 mb-2 text-blue-400/60" />
            ) : (
              <Film className="h-8 w-8 mb-2 text-red-500/60" />
            )}
            <span className="text-[11px] font-bold line-clamp-2 text-gray-300 px-2">
              {cleanTitle}
            </span>
          </div>
        )}

        {/* Cinematic Gradient Vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#11131a] via-transparent to-black/30 opacity-70 group-hover:opacity-85 transition-opacity" />

        {/* Top Badges */}
        <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none">
          {movie.rating ? (
            <div className="flex items-center gap-1 rounded-md bg-black/85 px-1.5 py-0.5 text-[10px] font-black text-amber-400 border border-white/10 shadow-sm">
              <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
              <span>{movie.rating}</span>
            </div>
          ) : <div />}

          <span
            className={`rounded px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wide shadow-sm ${
              isSeries
                ? "bg-blue-600/90 text-white"
                : "bg-red-600/90 text-white"
            }`}
          >
            {isSeries ? "TV SERIES" : "4K UHD"}
          </span>
        </div>

        {/* Play Icon on hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:scale-100 scale-75">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/50">
            <Play className="h-5 w-5 fill-white ml-0.5" />
          </div>
        </div>
      </Link>

      {/* Card Info */}
      <div className="p-3 flex flex-col justify-between flex-1">
        <Link href={`/movie?url=${encodeURIComponent(movie.url)}`}>
          <h3 className="text-xs font-bold text-gray-100 line-clamp-1 transition-colors group-hover:text-emerald-400">
            {cleanTitle}
          </h3>
        </Link>
        <div className="flex items-center justify-between text-[11px] text-gray-400 mt-2 font-medium">
          <div className="flex items-center gap-1.5">
            <span className="text-gray-300 font-semibold">{movie.year || "2026"}</span>
            <span className="text-gray-600">•</span>
            <span className="text-emerald-400 font-medium text-[10px]">⚡ Iframe Stream</span>
          </div>
          {movie.quality && (
            <span className="bg-white/[0.06] text-gray-300 border border-white/10 rounded px-1.5 py-0.5 text-[9px] font-mono font-bold">
              {movie.quality}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
