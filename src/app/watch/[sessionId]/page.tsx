"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Play,
  ArrowLeft,
  Copy,
  Check,
  Code,
  Share2,
  Clock,
  ShieldCheck,
  Sparkles,
  Film,
  Download,
  AlertTriangle,
} from "lucide-react";

interface SessionData {
  id: string;
  title: string;
  poster: string;
  backdrop?: string;
  quality: string;
  sizeText?: string;
  expiresAt: number;
  isSeries?: boolean;
  season?: number;
  episode?: number;
}

export default function WatchPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;

  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedIframe, setCopiedIframe] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!sessionId) return;

    const fetchSession = async () => {
      try {
        const res = await fetch(`/api/stream/session?id=${encodeURIComponent(sessionId)}`);
        if (!res.ok) {
          if (res.status === 410) {
            setIsExpired(true);
            throw new Error("This 8-hour stream session has expired.");
          }
          throw new Error("Stream session not found.");
        }
        const data = await res.json();
        setSession(data.session);

        if (Date.now() > data.session.expiresAt) {
          setIsExpired(true);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load stream");
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [sessionId]);

  // Countdown timer
  useEffect(() => {
    if (!session?.expiresAt) return;

    const updateTimer = () => {
      const diff = session.expiresAt - Date.now();
      if (diff <= 0) {
        setTimeLeft("Expired");
        setIsExpired(true);
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [session]);

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const embedUrl = `${origin}/embed/${sessionId}`;
  const watchUrl = `${origin}/watch/${sessionId}`;
  const iframeSnippet = `<iframe src="${embedUrl}" width="100%" height="100%" frameborder="0" allowfullscreen allow="autoplay; fullscreen; encrypted-media; picture-in-picture"></iframe>`;

  const copyIframe = () => {
    navigator.clipboard.writeText(iframeSnippet);
    setCopiedIframe(true);
    setTimeout(() => setCopiedIframe(false), 2000);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(watchUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#07090e] text-white">
        <div className="h-14 w-14 animate-spin rounded-full border-4 border-emerald-500/20 border-t-emerald-500"></div>
        <p className="mt-4 text-sm font-medium text-gray-300">Loading Cinema Theater...</p>
      </div>
    );
  }

  if (isExpired || error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#07090e] px-4 text-center text-white">
        <div className="rounded-2xl border border-red-500/20 bg-red-950/20 p-8 max-w-md backdrop-blur-xl">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-400" />
          <h1 className="mt-4 text-xl font-bold">Stream Session Expired</h1>
          <p className="mt-2 text-xs text-gray-400 leading-relaxed">
            {error || "This 8-hour private stream link has ended. All temporary stream links expire automatically after 8 hours to ensure zero lag and high-speed delivery."}
          </p>
          <div className="mt-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-3 text-xs font-semibold text-white shadow-lg shadow-emerald-950/40 hover:scale-105 transition-all"
            >
              <Sparkles className="h-4 w-4" />
              Browse & Request Another Movie
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07090e] text-white">
      {/* Top Navigation */}
      <header className="border-b border-white/[0.06] bg-[#0c0f17]/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs font-medium text-gray-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Catalog
          </Link>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-950/30 px-3 py-1 text-xs text-emerald-400">
              <Clock className="w-3.5 h-3.5 animate-pulse" />
              <span className="font-mono">{timeLeft}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Cinema Stage */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Responsive Player Container */}
        <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-white/[0.08] bg-black shadow-2xl shadow-emerald-950/20">
          <iframe
            src={`/embed/${sessionId}`}
            className="w-full h-full border-0"
            allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        </div>

        {/* Action & Info Panel */}
        <div className="mt-6 rounded-2xl border border-white/[0.08] bg-[#0c0f17] p-6 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 text-xs font-semibold text-emerald-300">
                  {session?.quality || "1080p Full HD"}
                </span>
                <span className="rounded-md bg-teal-500/10 border border-teal-500/20 px-2 py-0.5 text-xs text-teal-300 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> 100% Ad-Free
                </span>
                <span className="rounded-md bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 text-xs text-purple-300 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> 8 Hours Valid
                </span>
              </div>
              <h1 className="mt-2 text-xl md:text-2xl font-bold tracking-tight text-white">
                {session?.title}
              </h1>
              {session?.sizeText && (
                <p className="mt-1 text-xs text-gray-400">Video Size: {session.sizeText}</p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={copyIframe}
                className="flex items-center gap-2 rounded-xl border border-white/[0.1] bg-white/[0.05] px-4 py-2.5 text-xs font-medium text-white hover:bg-white/[0.1] transition-all"
              >
                {copiedIframe ? <Check className="w-4 h-4 text-emerald-400" /> : <Code className="w-4 h-4 text-gray-300" />}
                {copiedIframe ? "Iframe Copied!" : "Copy Iframe Code"}
              </button>

              <button
                onClick={copyLink}
                className="flex items-center gap-2 rounded-xl border border-white/[0.1] bg-white/[0.05] px-4 py-2.5 text-xs font-medium text-white hover:bg-white/[0.1] transition-all"
              >
                {copiedLink ? <Check className="w-4 h-4 text-teal-400" /> : <Share2 className="w-4 h-4 text-gray-300" />}
                {copiedLink ? "Link Copied!" : "Share Link"}
              </button>

              <Link
                href={`/api/stream/play/${sessionId}`}
                target="_blank"
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-emerald-950/30 hover:scale-105 transition-all"
              >
                <Download className="w-4 h-4" />
                Direct Stream File
              </Link>
            </div>
          </div>

          {/* Iframe Code Box */}
          <div className="mt-6 pt-6 border-t border-white/[0.06]">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                <Code className="w-3.5 h-3.5 text-emerald-400" />
                Embed on Any Website (HTML Iframe)
              </label>
              <button
                onClick={copyIframe}
                className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
              >
                {copiedIframe ? "Copied" : "Copy snippet"}
              </button>
            </div>
            <div className="relative rounded-xl border border-white/[0.07] bg-[#07090e] p-3 font-mono text-[11px] text-gray-300 overflow-x-auto select-all">
              {iframeSnippet}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
