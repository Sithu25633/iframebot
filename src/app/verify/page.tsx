"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { AdBanner } from "@/components/AdBanner";
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  ExternalLink,
  Film,
  Tv,
  ArrowLeft,
  Lock,
  Unlock,
  Zap,
  Check,
  Copy,
  AlertCircle,
} from "lucide-react";

interface RequestData {
  title: string;
  poster: string;
  url: string;
  type: string;
  season?: number;
  quality: string;
  token: string;
  userName?: string;
  userPhone?: string;
  isVip?: boolean;
  botPhone: string;
  message: string;
}

function VerifyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Extract query parameters
  const paramTitle = searchParams.get("title") || "Selected Movie";
  const paramType = searchParams.get("type") || "movie";
  const paramSeason = Number(searchParams.get("season")) || 1;
  const paramQuality = searchParams.get("quality") || "720p";
  const paramToken = searchParams.get("token") || "TOKEN";
  const paramUrl = searchParams.get("url") || "";
  const isParamSeries = paramType === "series" || paramType === "tv";
  const paramBotPhone = searchParams.get("botPhone") || (isParamSeries ? "94760372547" : "94760372547");
  const paramPoster = searchParams.get("poster") || "";

  const [requestData, setRequestData] = useState<RequestData>({
    title: paramTitle,
    poster: paramPoster,
    url: paramUrl,
    type: paramType,
    season: paramSeason,
    quality: paramQuality,
    token: paramToken,
    botPhone: paramBotPhone,
    message: "",
  });

  const TOTAL_SECONDS = 10;
  const [timeLeft, setTimeLeft] = useState<number>(TOTAL_SECONDS);
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [hasClickedWhatsApp, setHasClickedWhatsApp] = useState<boolean>(false);
  const [copiedToken, setCopiedToken] = useState<boolean>(false);

  // Restore cached session details if available
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = sessionStorage.getItem("filmfeed_verify_request");
        if (stored) {
          const parsed = JSON.parse(stored);
          setRequestData((prev) => ({
            ...prev,
            ...parsed,
            poster: parsed.poster || prev.poster,
            message: parsed.message || prev.message,
          }));
        }
      } catch (e) {}
    }
  }, []);

  // 10-Second Countdown Timer
  useEffect(() => {
    if (timeLeft <= 0) {
      setIsUnlocked(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsUnlocked(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const progressPercent = Math.min(
    100,
    Math.round(((TOTAL_SECONDS - timeLeft) / TOTAL_SECONDS) * 100)
  );

  // Construct message if not in storage
  const isSeries = requestData.type === "series";
  const finalMessage =
    requestData.message ||
    `🎬 ━━━━━━━━━━━━━━━━━━━━━━
   *FILMFEED 4K • OFFICIAL REQUEST*
━━━━━━━━━━━━━━━━━━━━━━ 🎬

🍿 *Content:* ${requestData.title}
📦 *Type:* ${isSeries ? `TV Series (Season ${requestData.season} Pack)` : "4K Ultra HD Movie"}
📺 *Quality:* ${requestData.quality}
🔑 *Security Token:* #${requestData.token}

⚡ *Request Source:* FilmFeed 4K Hub
🌐 *Hub URL:* https://web-umber-six-e1un7z6257.vercel.app

━━━━━━━━━━━━━━━━━━━━━━
${
  isSeries
    ? `!req_season ${requestData.url} | S${requestData.season} | ${requestData.quality} | ${requestData.token}`
    : `!req ${requestData.url} | ${requestData.quality} | ${requestData.token}`
}`;

  const isRequestSeries = requestData.type === "series" || requestData.type === "tv";
  const targetBotPhone = isRequestSeries ? "94760372547" : (requestData.botPhone || "94760372547");
  const waUrl = `https://api.whatsapp.com/send?phone=${targetBotPhone}&text=${encodeURIComponent(
    finalMessage
  )}`;

  const handleOpenWhatsApp = () => {
    if (!isUnlocked) return;

    // Direct link monetization hook (if configured in environment)
    const directLink = process.env.NEXT_PUBLIC_ADSTERRA_DIRECT_LINK;
    if (directLink && typeof window !== "undefined") {
      try {
        window.open(directLink, "_blank");
      } catch (e) {}
    }

    // Open WhatsApp
    window.open(waUrl, "_blank");
    setHasClickedWhatsApp(true);
  };

  const copyToken = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(`#${requestData.token}`);
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white px-4 py-8 max-w-3xl mx-auto flex flex-col items-center">
      {/* Back button & Breadcrumb */}
      <div className="w-full flex items-center justify-between mb-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-white transition-colors bg-surface-card border border-white/10 px-3.5 py-2 rounded-xl"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Browse</span>
        </Link>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="font-mono text-emerald-400 font-bold">Bot Gateway Active</span>
        </div>
      </div>

      {/* Security Gateway Badge */}
      <div className="w-full text-center mb-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-bold text-emerald-400 mb-3 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
          <ShieldCheck className="h-4 w-4" />
          <span>FILMFEED 4K SECURE BOT DISPATCH GATEWAY</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
          Decrypting Download Stream
        </h1>
        <p className="text-xs sm:text-sm text-gray-400 mt-1 max-w-lg mx-auto">
          Please wait while our server allocates high-speed 4K bandwidth and generates your single-device WhatsApp token.
        </p>
      </div>

      {/* TOP SPONSORED BANNER (High Viewability Impression) */}
      <div className="w-full">
        <AdBanner label="Sponsored Partner • High Speed Server" />
      </div>

      {/* Content Summary Card */}
      <div className="w-full rounded-3xl border border-white/10 bg-surface-card p-5 sm:p-6 mb-6 shadow-2xl backdrop-blur-md">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          {requestData.poster ? (
            <div className="relative w-24 h-36 sm:w-28 sm:h-40 flex-shrink-0 rounded-2xl overflow-hidden border border-white/20 shadow-lg">
              <Image
                src={requestData.poster}
                alt={requestData.title}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          ) : (
            <div className="w-24 h-36 sm:w-28 sm:h-40 flex-shrink-0 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
              {isSeries ? <Tv className="h-10 w-10 text-gray-500" /> : <Film className="h-10 w-10 text-gray-500" />}
            </div>
          )}

          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-2">
              <span className="rounded-lg bg-red-600/20 border border-red-500/30 px-2.5 py-0.5 text-[10px] font-black uppercase text-red-400">
                {isSeries ? `TV SERIES • S${requestData.season}` : "4K UHD MOVIE"}
              </span>
              <span className="rounded-lg bg-white/10 border border-white/20 px-2.5 py-0.5 text-[10px] font-black uppercase text-white">
                {requestData.quality}
              </span>
              <span className="rounded-lg bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-black uppercase text-emerald-400">
                SINHALA SUBTITLES
              </span>
            </div>

            <h2 className="text-lg sm:text-xl font-black text-white leading-snug line-clamp-2">
              {requestData.title}
            </h2>

            <div className="mt-4 flex flex-wrap items-center justify-center sm:justify-start gap-3">
              <div className="flex items-center gap-2 bg-black/60 border border-white/10 px-3 py-1.5 rounded-xl text-xs">
                <span className="text-gray-400">Token:</span>
                <span className="font-mono font-bold text-amber-400">#{requestData.token}</span>
                <button
                  onClick={copyToken}
                  className="text-gray-400 hover:text-white transition-colors ml-1"
                  title="Copy token"
                >
                  {copiedToken ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>

              <div className="flex items-center gap-2 bg-black/60 border border-white/10 px-3 py-1.5 rounded-xl text-xs">
                <span className="text-gray-400">Bot:</span>
                <span className="font-mono text-gray-200">+{targetBotPhone}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* VERIFICATION & TIMER PROGRESS CARD */}
      <div className="w-full rounded-3xl border border-white/15 bg-gradient-to-b from-surface-card to-black p-6 mb-6 shadow-2xl relative overflow-hidden">
        {/* Glow ambient background */}
        <div
          className={`absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full blur-3xl pointer-events-none transition-all duration-1000 ${
            isUnlocked ? "bg-emerald-500/20" : "bg-amber-500/15"
          }`}
        />

        <div className="relative z-10 flex flex-col items-center text-center">
          {/* Circular Countdown Display */}
          <div className="relative w-32 h-32 flex items-center justify-center mb-5">
            {/* SVG Circle Progress */}
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="42"
                className="stroke-white/10"
                strokeWidth="7"
                fill="transparent"
              />
              <circle
                cx="50"
                cy="50"
                r="42"
                className={`transition-all duration-1000 ease-linear ${
                  isUnlocked ? "stroke-emerald-500" : "stroke-amber-400"
                }`}
                strokeWidth="7"
                strokeDasharray={2 * Math.PI * 42}
                strokeDashoffset={2 * Math.PI * 42 * (1 - progressPercent / 100)}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>

            {/* Inner Content */}
            <div className="absolute flex flex-col items-center justify-center">
              {isUnlocked ? (
                <>
                  <Unlock className="h-8 w-8 text-emerald-400 animate-bounce" />
                  <span className="text-[11px] font-black uppercase text-emerald-400 mt-1">READY</span>
                </>
              ) : (
                <>
                  <span className="text-3xl font-black font-mono text-white">{timeLeft}</span>
                  <span className="text-[10px] font-bold uppercase text-gray-400">SECONDS</span>
                </>
              )}
            </div>
          </div>

          {/* Linear Progress Bar */}
          <div className="w-full max-w-md bg-white/10 h-2 rounded-full overflow-hidden mb-5">
            <div
              className={`h-full transition-all duration-1000 ease-linear ${
                isUnlocked ? "bg-emerald-500" : "bg-gradient-to-r from-amber-500 to-emerald-400"
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* High-Tech Dynamic Status Stepper */}
          <div className="w-full max-w-md bg-black/50 border border-white/10 rounded-2xl p-4 text-left space-y-2.5 text-xs mb-6">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-gray-300">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>1. CineSubz 4K Mirror Link Verified</span>
              </span>
              <span className="font-mono text-[10px] text-emerald-400 font-bold">100% OK</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-gray-300">
                {timeLeft <= 7 ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                ) : (
                  <Clock className="h-4 w-4 text-amber-400 animate-spin" />
                )}
                <span>2. Allocating High-Speed Bot Slot</span>
              </span>
              <span className="font-mono text-[10px] text-gray-400">
                {timeLeft <= 7 ? "ALLOCATED" : "IN PROGRESS"}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-gray-300">
                {timeLeft <= 3 ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                ) : (
                  <Clock className="h-4 w-4 text-gray-500" />
                )}
                <span>3. Binding Security Token #{requestData.token}</span>
              </span>
              <span className="font-mono text-[10px] text-gray-400">
                {timeLeft <= 3 ? "BOUND" : "PENDING"}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-gray-300">
                {isUnlocked ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                ) : (
                  <Lock className="h-4 w-4 text-gray-500" />
                )}
                <span>4. WhatsApp Bot Direct Dispatch</span>
              </span>
              <span
                className={`font-mono text-[10px] font-bold ${
                  isUnlocked ? "text-emerald-400 animate-pulse" : "text-gray-500"
                }`}
              >
                {isUnlocked ? "UNLOCKED ⚡" : "LOCKED"}
              </span>
            </div>
          </div>

          {/* MAIN ACTION / UNLOCK BUTTON */}
          <div className="w-full max-w-md">
            {isUnlocked ? (
              <button
                onClick={handleOpenWhatsApp}
                className="w-full flex flex-col items-center justify-center gap-1 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 py-4 px-6 text-white font-black shadow-[0_0_30px_rgba(16,185,129,0.4)] hover:brightness-110 active:scale-98 transition-all animate-pulse"
              >
                <div className="flex items-center gap-2 text-base sm:text-lg">
                  <Zap className="h-5 w-5 fill-white" />
                  <span>OPEN WHATSAPP BOT &amp; GET MOVIE</span>
                  <ExternalLink className="h-4 w-4" />
                </div>
                <span className="text-[11px] font-normal text-emerald-100">
                  Tap here to send token to bot &amp; receive file directly
                </span>
              </button>
            ) : (
              <button
                disabled
                className="w-full flex items-center justify-center gap-3 rounded-2xl bg-white/10 border border-white/20 py-4 px-6 text-sm font-bold text-gray-400 cursor-not-allowed"
              >
                <Lock className="h-4 w-4 text-amber-400" />
                <span>DECRYPTING LINK... PLEASE WAIT ({timeLeft}s)</span>
              </button>
            )}

            <p className="text-[11px] text-gray-400 mt-3 text-center">
              {isUnlocked
                ? "⚡ Bot will automatically verify your token and respond within 10-30 seconds in WhatsApp!"
                : "💡 Keeping this page open for 10 seconds helps us maintain free 4K high-speed servers."}
            </p>
          </div>
        </div>
      </div>

      {/* SECOND SPONSORED BANNER (High Conversion Slot) */}
      <div className="w-full">
        <AdBanner label="Sponsored Partner • Unlimited Cloud Speed" />
      </div>

      {/* WhatsApp Post-Click Instructions */}
      {hasClickedWhatsApp && (
        <div className="w-full rounded-2xl border border-emerald-500/30 bg-emerald-950/30 p-4 mb-6 text-xs text-gray-300 animate-fadeIn">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-white mb-1">WhatsApp Chat Opened!</p>
              <p className="text-gray-300">
                1. Simply press <strong className="text-white">SEND</strong> on WhatsApp without editing the message.
              </p>
              <p className="text-gray-300 mt-1">
                2. Our Auto-Bot will instantly receive your command and send your 4K Google Drive / Direct download file!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Info Box */}
      <div className="w-full rounded-2xl border border-white/10 bg-surface-card p-4 text-xs text-gray-400 space-y-2">
        <div className="flex items-center gap-2 text-white font-bold">
          <Sparkles className="h-4 w-4 text-amber-400" />
          <span>Why did this page appear?</span>
        </div>
        <p>
          FilmFeed is a 100% free community service providing 4K movies and complete TV series packs. By waiting 10 seconds on this gateway, our cloud server allocates dedicated bot resources and our sponsors cover the high-bandwidth hosting costs. Thank you for your support!
        </p>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black flex items-center justify-center text-white text-sm">
          <div className="flex items-center gap-3">
            <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span>Loading FilmFeed 4K Gateway...</span>
          </div>
        </div>
      }
    >
      <VerifyContent />
    </Suspense>
  );
}
