"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { MovieDetail, SeriesEpisode } from "@/lib/cinesubz";
import { RequestModal } from "@/components/RequestModal";
import { IframeRequestModal } from "@/components/IframeRequestModal";
import { VipShareModal } from "@/components/VipShareModal";
import { AdBanner } from "@/components/AdBanner";
import { getVipStatus } from "@/lib/vip";
import { getCurrentUser } from "@/lib/userState";
import {
  Star,
  Calendar,
  MessageSquare,
  ArrowLeft,
  Users,
  ShieldCheck,
  DownloadCloud,
  Film,
  Tv,
  Crown,
  Play,
  CheckCircle2,
} from "lucide-react";

function MovieDetailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const movieUrl = searchParams.get("url");

  const [movie, setMovie] = useState<MovieDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isIframeModalOpen, setIsIframeModalOpen] = useState(false);
  const [isVipModalOpen, setIsVipModalOpen] = useState(false);
  const [isVip, setIsVip] = useState(false);
  const [activeSeason, setActiveSeason] = useState<number>(1);
  const [selectedQuality, setSelectedQuality] = useState<string>("720p");

  useEffect(() => {
    const user = getCurrentUser();
    setIsVip(Boolean(user?.isVip || getVipStatus()));
  }, []);

  useEffect(() => {
    if (!movieUrl) {
      setError("No movie or series specified");
      setLoading(false);
      return;
    }

    const fetchMovie = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/movie?url=${encodeURIComponent(movieUrl)}`);
        if (!res.ok) throw new Error("Failed to load details");
        const data = await res.json();
        setMovie(data.movie);
        if (data.movie?.episodes && data.movie.episodes.length > 0) {
          setActiveSeason(data.movie.episodes[0].season);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load movie");
      } finally {
        setLoading(false);
      }
    };

    fetchMovie();
  }, [movieUrl]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 rounded-full border-4 border-white/20 border-t-white animate-spin" />
          <p className="text-xs font-mono uppercase tracking-widest text-gray-400">Loading Content...</p>
        </div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 text-center">
        <h2 className="text-lg font-black text-white mb-2">Content Not Found</h2>
        <p className="text-xs text-gray-400 mb-6">{error || "Unable to fetch content details"}</p>
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-xs font-black text-black"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Home</span>
        </button>
      </div>
    );
  }

  const isSeries = movie.kind === "series" || (movie.episodes && movie.episodes.length > 0);
  const seasonsMap: { [key: number]: SeriesEpisode[] } = {};
  if (isSeries && movie.episodes) {
    movie.episodes.forEach((ep) => {
      if (!seasonsMap[ep.season]) seasonsMap[ep.season] = [];
      seasonsMap[ep.season].push(ep);
    });
  }
  const availableSeasons = Object.keys(seasonsMap).map(Number).sort((a, b) => a - b);
  const currentSeasonEpisodes = seasonsMap[activeSeason] || [];

  const handleActionClick = (quality?: string, season?: number) => {
    if (quality) setSelectedQuality(quality);
    if (season) setActiveSeason(season);
    setIsModalOpen(true);
  };

  const defaultQualities = [
    {
      quality: "1080p",
      label: "1080p Full HD",
      meta: "1080p • WEB-DL • Ultra Clear",
      sizeText: "1.4 GB - 1.9 GB",
      ztUrl: "",
    },
    {
      quality: "720p",
      label: "720p HD Ready",
      meta: "720p • WEB-DL • Recommended",
      sizeText: "800 MB - 1.1 GB",
      ztUrl: "",
    },
    {
      quality: "480p",
      label: "480p SD Mobile",
      meta: "480p • WEB-DL • Data Saver",
      sizeText: "400 MB - 550 MB",
      ztUrl: "",
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white pb-24">
      {/* Backdrop Banner */}
      <div className="relative h-[320px] sm:h-[440px] w-full overflow-hidden">
        {movie.backdrop && (
          <img
            src={movie.backdrop}
            alt={movie.title}
            className="h-full w-full object-cover object-top filter brightness-40"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-transparent" />

        {/* Back Button */}
        <div className="absolute top-4 left-4 z-20">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 rounded-2xl bg-black/80 px-4 py-2 text-xs font-bold text-white backdrop-blur-md border border-white/20 hover:bg-white/20 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </button>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 -mt-36 sm:-mt-48 z-20">
        <div className="flex flex-col md:flex-row gap-6 lg:gap-10">
          {/* Left Column: Poster & Action Button */}
          <div className="w-full md:w-72 shrink-0 flex flex-col items-center md:items-start">
            <div className="relative aspect-[2/3] w-56 md:w-full overflow-hidden rounded-3xl border border-white/20 bg-surface shadow-2xl">
              {movie.poster ? (
                <img
                  src={movie.poster}
                  alt={movie.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs text-gray-500">
                  No Poster
                </div>
              )}
              {/* Badges */}
              <div className="absolute top-3 left-3">
                <span className="rounded bg-red-600 px-2 py-0.5 text-[10px] font-black text-white uppercase tracking-wider">
                  {isSeries ? "TV SERIES" : "4K UHD"}
                </span>
              </div>
            </div>

            {/* BIG ACTION BUTTON */}
            <div className="w-full mt-5 space-y-2.5">
              <button
                onClick={() => setIsIframeModalOpen(true)}
                className="w-full flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 py-4 px-6 text-sm font-black text-white shadow-xl shadow-emerald-950/50 hover:brightness-110 active:scale-98 transition-all"
              >
                <Play className="h-5 w-5 fill-white" />
                <span>REQUEST ONLINE IFRAME WEB</span>
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-emerald-400">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>100% Ad-Free • Buffer-Free High-Speed CDN • 8h TTL</span>
              </div>
            </div>
          </div>

          {/* Right Column: Details & Episode List / Qualities */}
          <div className="flex-1 space-y-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                {movie.title}
              </h1>
              {movie.tagline && (
                <p className="text-xs sm:text-sm italic text-gray-400 mt-1">
                  &ldquo;{movie.tagline}&rdquo;
                </p>
              )}

              {/* Meta Chips */}
              <div className="flex flex-wrap items-center gap-2 mt-3 text-xs">
                {movie.imdbRating && (
                  <div className="flex items-center gap-1 rounded-lg bg-surface px-2.5 py-1 font-bold text-white border border-white/20">
                    <Star className="h-3.5 w-3.5 fill-white text-white" />
                    <span>IMDb {movie.imdbRating}</span>
                  </div>
                )}
                {movie.year && (
                  <div className="flex items-center gap-1 rounded-lg bg-surface px-2.5 py-1 text-gray-300 border border-white/10">
                    <Calendar className="h-3.5 w-3.5 text-gray-400" />
                    <span>{movie.year}</span>
                  </div>
                )}
                <div className="rounded-lg bg-white/10 px-2.5 py-1 font-bold text-white border border-white/20">
                  Sinhala Subtitles
                </div>
              </div>
            </div>

            {/* Adsterra In-Content Banner (Hides automatically for VIPs) */}
            <AdBanner />

            {/* TV Series Season & Quality Section */}
            {isSeries ? (
              <div className="rounded-3xl border border-white/15 bg-surface-card p-5 space-y-5">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
                    <h3 className="text-sm font-black text-white flex items-center gap-2">
                      <Tv className="h-4 w-4 text-white" />
                      <span>1. Select Season</span>
                    </h3>
                    <span className="text-[10px] uppercase font-bold text-emerald-400 rounded-md border border-white/20 bg-surface px-2 py-0.5">
                      Dual Group Delivery
                    </span>
                  </div>

                  {/* Season Tabs */}
                  {availableSeasons.length > 1 ? (
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-3 no-scrollbar">
                      {availableSeasons.map((s) => (
                        <button
                          key={s}
                          onClick={() => setActiveSeason(s)}
                          className={`shrink-0 rounded-xl px-4 py-2.5 text-xs font-black transition-all ${
                            activeSeason === s
                              ? "bg-white text-black shadow-glow-white border-2 border-white scale-102"
                              : "bg-surface border border-white/10 text-gray-300 hover:border-white/30"
                          }`}
                        >
                          Season {s} ({seasonsMap[s]?.length || 0} EPs)
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-xl bg-surface p-3 text-xs font-bold text-gray-300 border border-white/10 mb-3">
                      Season 1 ({currentSeasonEpisodes.length} Episodes available)
                    </div>
                  )}
                </div>

                {/* TV Series Quality Selector */}
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-3">
                    <h3 className="text-sm font-black text-white flex items-center gap-2">
                      <DownloadCloud className="h-4 w-4 text-white" />
                      <span>2. Select Quality for All Episodes</span>
                    </h3>
                    <span className="text-[10px] font-mono text-gray-400">Sinhala Subtitles Included</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {defaultQualities.map((q) => {
                      const isSelected = selectedQuality.toLowerCase().includes(q.quality) || selectedQuality === q.quality;
                      return (
                        <button
                          key={q.quality}
                          type="button"
                          onClick={() => setSelectedQuality(q.quality)}
                          className={`flex flex-col text-left p-3 rounded-2xl border transition-all ${
                            isSelected
                              ? "bg-white text-black border-white shadow-glow-white scale-102"
                              : "bg-surface border-white/10 hover:border-white/30 text-white"
                          }`}
                        >
                          <div className="flex items-center justify-between w-full mb-1">
                            <span className="text-xs font-black">{q.label}</span>
                            <span
                              className={`rounded px-1.5 py-0.2 text-[8px] font-black uppercase ${
                                isSelected ? "bg-black text-white" : "bg-white/10 text-gray-300"
                              }`}
                            >
                              {q.quality}
                            </span>
                          </div>
                          <span className={`text-[10px] ${isSelected ? "text-black/70" : "text-gray-400"}`}>
                            {q.sizeText} / ep
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Episode List */}
                <div>
                  <label className="text-xs font-bold text-gray-400 block mb-2">
                    Episodes in Season {activeSeason} ({currentSeasonEpisodes.length} Total):
                  </label>
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {currentSeasonEpisodes.map((ep) => (
                      <div
                        key={ep.url}
                        className="flex items-center justify-between gap-3 rounded-2xl bg-surface/80 p-2.5 border border-white/5"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-white/10 text-white font-mono text-xs font-black">
                            {ep.episode}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-white truncate">{ep.title}</p>
                            <p className="text-[9px] text-gray-500">Season {ep.season} • Episode {ep.episode}</p>
                          </div>
                        </div>

                        <span className="text-[9px] font-bold text-gray-400 shrink-0">Included</span>
                      </div>
                    ))}

                  </div>
                </div>

                {/* Download Whole Season Callout */}
                <div className="rounded-2xl border border-white/20 bg-black/80 p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-center sm:text-left text-xs">
                    <p className="font-black text-white text-sm">
                      Season {activeSeason} Complete Pack ({selectedQuality.toUpperCase()})
                    </p>
                    <p className="text-[11px] text-gray-400">
                      All {currentSeasonEpisodes.length} episodes will be uploaded in sequence
                    </p>
                  </div>
                  <button
                    onClick={() => handleActionClick(selectedQuality, activeSeason)}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-2.5 text-xs font-black text-black hover:bg-gray-200 transition-all shadow-glow-white"
                  >
                    <DownloadCloud className="h-4 w-4" />
                    <span>Request S{activeSeason} ({selectedQuality.toUpperCase()})</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Single Movie Quality Selector Section */
              <div className="rounded-3xl border border-white/15 bg-surface-card p-5">
                <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
                  <h3 className="text-sm font-black text-white flex items-center gap-2">
                    <DownloadCloud className="h-4 w-4 text-white" />
                    <span>Select Quality for WhatsApp Request</span>
                  </h3>
                  <span className="text-[10px] font-bold text-emerald-400">24/7 Fast Delivery</span>
                </div>

                <div className="space-y-2.5">
                  {(movie.qualities && movie.qualities.length > 0 ? movie.qualities : defaultQualities).map((q, idx) => {
                    const isSelected = selectedQuality.toLowerCase().includes(q.quality) || selectedQuality === q.quality;
                    return (
                      <div
                        key={idx}
                        onClick={() => setSelectedQuality(q.quality)}
                        className={`cursor-pointer flex items-center justify-between gap-3 rounded-2xl p-3.5 border transition-all ${
                          isSelected
                            ? "bg-white text-black border-white shadow-glow-white"
                            : "bg-surface border-white/10 hover:border-white/30 text-white"
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-black">{q.label || q.quality}</span>
                            <span className={`rounded px-1.5 py-0.2 text-[9px] font-bold ${
                              isSelected ? "bg-black text-white" : "bg-white/10 text-gray-300"
                            }`}>
                              Sinhala Sub
                            </span>
                            {isSelected && (
                              <span className="rounded bg-black text-white px-1.5 py-0.2 text-[9px] font-black uppercase">
                                Selected
                              </span>
                            )}
                          </div>
                          <p className={`text-[11px] mt-0.5 ${isSelected ? "text-black/70" : "text-gray-400"}`}>
                            {q.meta || q.label}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          {q.sizeText && (
                            <span className={`text-[11px] font-mono px-2.5 py-1 rounded-lg border ${
                              isSelected ? "bg-black/10 border-black/20 text-black font-bold" : "bg-black/60 border-white/10 text-gray-300"
                            }`}>
                              {q.sizeText}
                            </span>
                          )}

                          {/* WhatsApp Request Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleActionClick(q.quality);
                            }}
                            className={`flex items-center gap-1 rounded-xl px-3.5 py-1.5 text-xs font-black transition-all shrink-0 ${
                              isSelected
                                ? "bg-black text-white hover:bg-gray-800"
                                : "bg-white text-black hover:bg-gray-200"
                            }`}
                          >
                            <MessageSquare className="h-3.5 w-3.5" />
                            <span>Request</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}

                </div>
              </div>
            )}

            {/* Storyline / Synopsis */}
            <div className="rounded-3xl border border-white/15 bg-surface-card p-5">
              <h3 className="text-sm font-black text-white mb-2 flex items-center gap-2">
                <Film className="h-4 w-4 text-white" />
                <span>Storyline / සාරාංශය</span>
              </h3>
              <p className="text-xs leading-relaxed text-gray-300 whitespace-pre-line">
                {movie.description || "No synopsis available for this title."}
              </p>
            </div>

            {/* Mid Banner */}
            <AdBanner />

            {/* Cast */}
            {movie.cast && movie.cast.length > 0 && (
              <div className="rounded-3xl border border-white/15 bg-surface-card p-5">
                <h3 className="text-sm font-black text-white mb-3 flex items-center gap-2">
                  <Users className="h-4 w-4 text-white" />
                  <span>Starring Cast</span>
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {movie.cast.slice(0, 6).map((c, i) => (
                    <div key={i} className="flex items-center gap-2 rounded-xl bg-surface p-2 border border-white/5">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10 text-white text-xs font-black">
                        {c.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-white truncate">{c.name}</p>
                        {c.role && <p className="text-[9px] text-gray-400 truncate">{c.role}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom Banner */}
            <AdBanner />
          </div>
        </div>
      </div>

      {/* Modals */}
      <RequestModal
        movie={movie}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        botPhone={isSeries ? "94760372547" : "94760372547"}
        initialQuality={selectedQuality}
        initialSeason={activeSeason}
      />

      <IframeRequestModal
        isOpen={isIframeModalOpen}
        onClose={() => setIsIframeModalOpen(false)}
        movie={{
          title: movie.title,
          url: movie.url,
          poster: movie.poster,
          qualities: movie.qualities?.map((q) => ({ label: q.label, quality: q.quality, sizeText: q.sizeText })),
          isSeries: Boolean(isSeries),
          episodes: movie.episodes?.map((e) => ({ season: e.season, episode: e.episode, title: e.title, url: e.url })),
        }}
      />

      <VipShareModal
        isOpen={isVipModalOpen}
        onClose={() => setIsVipModalOpen(false)}
        onVipActivated={() => {
          setIsVip(true);
          setIsVipModalOpen(false);
          setIsModalOpen(true);
        }}
        seriesTitle={movie.title}
      />
    </div>
  );
}

export default function MovieDetailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center text-white">Loading...</div>}>
      <MovieDetailContent />
    </Suspense>
  );
}
