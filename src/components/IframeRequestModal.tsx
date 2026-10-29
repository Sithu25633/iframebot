"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Play,
  X,
  Code,
  Copy,
  Check,
  ExternalLink,
  Clock,
  ShieldCheck,
  Sparkles,
  AlertCircle,
  Tv,
  Film,
} from "lucide-react";

interface QualityOption {
  label: string;
  quality: string;
  sizeText?: string;
}

interface IframeRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  movie: {
    title: string;
    url: string;
    poster: string;
    qualities?: QualityOption[];
    isSeries?: boolean;
    episodes?: { season: number; episode: number; title: string; url: string }[];
  };
}

export const IframeRequestModal: React.FC<IframeRequestModalProps> = ({
  isOpen,
  onClose,
  movie,
}) => {
  const [selectedQuality, setSelectedQuality] = useState<string>("720p");
  const [selectedEpisodeUrl, setSelectedEpisodeUrl] = useState<string>(
    movie.episodes && movie.episodes.length > 0 ? movie.episodes[0].url : movie.url
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [streamResult, setStreamResult] = useState<{
    sessionId: string;
    watchUrl: string;
    embedUrl: string;
    iframeCode: string;
    expiresAt: number;
    quality: string;
  } | null>(null);
  const [copiedIframe, setCopiedIframe] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  const handleResolveStream = async () => {
    setLoading(true);
    setError(null);
    setStreamResult(null);

    try {
      const targetUrl = movie.isSeries ? selectedEpisodeUrl : movie.url;
      const res = await fetch("/api/stream/resolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: targetUrl,
          quality: selectedQuality,
          isSeries: movie.isSeries,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to resolve stream link.");
      }

      setStreamResult({
        sessionId: data.sessionId,
        watchUrl: data.watchUrl,
        embedUrl: data.embedUrl,
        iframeCode: data.iframeCode,
        expiresAt: data.expiresAt,
        quality: data.quality,
      });
    } catch (err: any) {
      setError(err.message || "An error occurred while generating the stream.");
    } finally {
      setLoading(false);
    }
  };

  const copyIframe = () => {
    if (!streamResult) return;
    navigator.clipboard.writeText(streamResult.iframeCode);
    setCopiedIframe(true);
    setTimeout(() => setCopiedIframe(false), 2000);
  };

  const copyLink = () => {
    if (!streamResult) return;
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    navigator.clipboard.writeText(`${origin}${streamResult.watchUrl}`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-white/[0.1] bg-[#0c0f17] p-6 shadow-2xl shadow-emerald-950/30 text-white">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-full p-1.5 text-gray-400 hover:text-white hover:bg-white/[0.08] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 border-b border-white/[0.06] pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-950/50">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white leading-snug">
              Request Online Iframe Web Stream
            </h2>
            <p className="text-xs text-gray-400 flex items-center gap-1.5 mt-0.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              100% Ad-Free • Buffer-Free High Speed • 8 Hours Expiration
            </p>
          </div>
        </div>

        {/* Movie Info Snippet */}
        <div className="mt-4 flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
          {movie.poster && (
            <img
              src={movie.poster}
              alt={movie.title}
              className="h-16 w-11 rounded-lg object-cover border border-white/[0.08]"
            />
          )}
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold text-white truncate">{movie.title}</h3>
            <p className="text-[11px] text-gray-400 mt-0.5">
              {movie.isSeries ? "TV Series Episode Stream" : "Feature Movie Stream"}
            </p>
          </div>
        </div>

        {/* Options & Generation Form */}
        {!streamResult && (
          <div className="mt-5 space-y-4">
            {/* TV Series Episode Selection if applicable */}
            {movie.isSeries && movie.episodes && movie.episodes.length > 0 && (
              <div>
                <label className="text-xs font-semibold text-gray-300 mb-1.5 block">
                  Select Episode
                </label>
                <select
                  value={selectedEpisodeUrl}
                  onChange={(e) => setSelectedEpisodeUrl(e.target.value)}
                  className="w-full rounded-xl border border-white/[0.1] bg-[#141824] px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                >
                  {movie.episodes.map((ep, idx) => (
                    <option key={idx} value={ep.url}>
                      S{ep.season} E{ep.episode}: {ep.title || `Episode ${ep.episode}`}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Quality Selector */}
            <div>
              <label className="text-xs font-semibold text-gray-300 mb-1.5 block">
                Select Stream Quality
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "1080p", label: "1080p Ultra HD", sub: "Best Quality" },
                  { id: "720p", label: "720p High Def", sub: "Fast & Smooth" },
                  { id: "480p", label: "480p Standard", sub: "Data Saver" },
                ].map((q) => (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => setSelectedQuality(q.id)}
                    className={`flex flex-col items-center justify-center rounded-xl border p-2.5 text-center transition-all ${
                      selectedQuality === q.id
                        ? "border-emerald-500 bg-emerald-950/30 text-emerald-300 shadow-md shadow-emerald-950/40"
                        : "border-white/[0.08] bg-white/[0.03] text-gray-300 hover:border-white/[0.15]"
                    }`}
                  >
                    <span className="text-xs font-bold">{q.label}</span>
                    <span className="text-[10px] text-gray-400 mt-0.5">{q.sub}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Error Notice */}
            {error && (
              <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-950/20 p-3 text-xs text-red-300">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={handleResolveStream}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 py-3 text-xs font-bold text-white shadow-lg shadow-emerald-950/50 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white"></div>
                  <span>Resolving Stream via CineSubz Engine...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Start Ad-Free Stream & Get Iframe</span>
                </>
              )}
            </button>

            <p className="text-center text-[11px] text-gray-400">
              ⚡ Streams directly from dedicated high-speed Cloudflare R2 / S3 CDN with 0 lag.
            </p>
          </div>
        )}

        {/* Resolved Stream Result */}
        {streamResult && (
          <div className="mt-5 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            {/* Embedded Mini Player Preview */}
            <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-emerald-500/30 bg-black shadow-lg">
              <iframe
                src={streamResult.embedUrl}
                className="w-full h-full border-0"
                allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
                allowFullScreen
              />
            </div>

            {/* Expiration Note */}
            <div className="flex items-center justify-between rounded-xl border border-emerald-500/20 bg-emerald-950/20 px-3 py-2 text-xs text-emerald-300">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400" />
                <span>Private Stream Active (Valid for 8 Hours)</span>
              </div>
              <span className="font-mono text-[11px] bg-emerald-500/20 px-2 py-0.5 rounded text-emerald-300">
                8h TTL
              </span>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-2">
              <Link
                href={streamResult.watchUrl}
                target="_blank"
                className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-950/40 hover:scale-[1.02] transition-all"
              >
                <Play className="w-4 h-4 fill-current" />
                Theater Fullscreen
              </Link>

              <button
                onClick={copyIframe}
                className="flex items-center justify-center gap-2 rounded-xl border border-white/[0.1] bg-white/[0.05] py-2.5 text-xs font-semibold text-white hover:bg-white/[0.1] transition-all"
              >
                {copiedIframe ? <Check className="w-4 h-4 text-emerald-400" /> : <Code className="w-4 h-4" />}
                {copiedIframe ? "Iframe Copied!" : "Copy Iframe Code"}
              </button>
            </div>

            {/* Iframe Code Box */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-medium text-gray-400">
                  Iframe Embed Code:
                </label>
                <button
                  onClick={copyIframe}
                  className="text-[11px] text-emerald-400 hover:text-emerald-300"
                >
                  {copiedIframe ? "Copied" : "Copy"}
                </button>
              </div>
              <div className="rounded-lg border border-white/[0.08] bg-[#07090e] p-2.5 font-mono text-[10px] text-gray-300 select-all overflow-x-auto">
                {streamResult.iframeCode}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
