"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  RotateCcw,
  RotateCw,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
} from "lucide-react";

interface SessionData {
  id: string;
  title: string;
  poster: string;
  backdrop?: string;
  quality: string;
  sizeText?: string;
  expiresAt: number;
  expired?: boolean;
}

export default function IframeEmbedPage() {
  const params = useParams();
  const sessionId = params.sessionId as string;

  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [isExpired, setIsExpired] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch session metadata
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

  // Live Countdown Timer
  useEffect(() => {
    if (!session?.expiresAt) return;

    const updateTimer = () => {
      const diff = session.expiresAt - Date.now();
      if (diff <= 0) {
        setTimeLeft("Expired (8h Limit Reached)");
        setIsExpired(true);
        if (videoRef.current) {
          videoRef.current.pause();
        }
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

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!videoRef.current) return;
      if (e.code === "Space") {
        e.preventDefault();
        if (videoRef.current.paused) {
          videoRef.current.play();
        } else {
          videoRef.current.pause();
        }
      } else if (e.code === "ArrowRight") {
        videoRef.current.currentTime += 10;
      } else if (e.code === "ArrowLeft") {
        videoRef.current.currentTime -= 10;
      } else if (e.code === "KeyF") {
        if (!document.fullscreenElement) {
          videoRef.current.requestFullscreen().catch(() => {});
        } else {
          document.exitFullscreen().catch(() => {});
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };

  const streamSrc = `/api/stream/play/${sessionId}`;

  if (loading) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-[#07090e] text-white">
        <div className="relative flex items-center justify-center">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-emerald-500/20 border-t-emerald-500"></div>
          <Sparkles className="absolute h-6 w-6 text-emerald-400 animate-pulse" />
        </div>
        <p className="mt-4 text-sm font-medium tracking-wide text-gray-300">
          Connecting to High-Speed Stream Server...
        </p>
        <span className="mt-1 text-xs text-gray-500">100% Ad-Free • Buffer-Free High-Speed CDN</span>
      </div>
    );
  }

  if (isExpired || error) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-[#07090e] px-4 text-center text-white">
        <div className="rounded-2xl border border-red-500/20 bg-red-950/20 p-6 backdrop-blur-md max-w-md">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 text-red-400">
            <AlertTriangle className="h-7 w-7" />
          </div>
          <h2 className="mt-4 text-lg font-bold text-white">Stream Session Expired</h2>
          <p className="mt-2 text-xs leading-relaxed text-gray-400">
            {error || "This streaming link has reached its maximum 8-hour lifetime. To maintain server speed and privacy, streams are automatically purged after 8 hours."}
          </p>
          <div className="mt-5">
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-emerald-900/30 transition-all hover:scale-105"
            >
              <Sparkles className="h-4 w-4" />
              Request Fresh Stream on Website
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onMouseMove={handleMouseMove}
      className="relative flex h-screen w-screen overflow-hidden bg-black select-none"
    >
      {/* Top Header Overlay */}
      <div
        className={`absolute top-0 left-0 right-0 z-30 flex items-center justify-between bg-gradient-to-b from-black/80 via-black/40 to-transparent p-4 transition-opacity duration-300 ${
          showControls ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-400">
            <Play className="h-4 w-4 fill-current" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-white truncate max-w-[280px] sm:max-w-md">
              {session?.title || "Movie Stream"}
            </h1>
            <div className="flex items-center gap-2 text-[11px] text-gray-400">
              <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-emerald-300 font-mono text-[10px]">
                {session?.quality || "HD 720p"}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-teal-400">
                <ShieldCheck className="h-3 w-3" /> Ad-Free Iframe
              </span>
            </div>
          </div>
        </div>

        {/* 8-Hour Countdown Badge */}
        <div className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-black/60 px-3 py-1.5 backdrop-blur-md">
          <Clock className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
          <span className="text-[11px] font-mono font-medium text-emerald-300">
            {timeLeft || "8h 00m 00s"}
          </span>
        </div>
      </div>

      {/* Main HTML5 Video Player */}
      <video
        ref={videoRef}
        src={streamSrc}
        poster={session?.backdrop || session?.poster || undefined}
        controls
        playsInline
        preload="metadata"
        crossOrigin="anonymous"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        className="h-full w-full object-contain"
      >
        Your browser does not support the video tag.
      </video>
    </div>
  );
}
