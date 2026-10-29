"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Sparkles, X, CheckCircle2, MessageSquare, Search, DownloadCloud, Tv, Film } from "lucide-react";
import { getCurrentUser } from "@/lib/userState";

export const HowToUseModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    // Check if redirected from Google Login with welcome_tutorial=true
    const isTutorialRequested = searchParams?.get("welcome_tutorial") === "true";
    const user = getCurrentUser();

    if (isTutorialRequested && user) {
      setIsOpen(true);
    }
  }, [searchParams]);

  if (!isOpen) return null;

  const handleClose = () => {
    setIsOpen(false);
    // Remove query param cleanly without reloading
    const url = new URL(window.location.href);
    url.searchParams.delete("welcome_tutorial");
    window.history.replaceState({}, "", url.pathname);
  };

  const user = getCurrentUser();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-fadeIn text-white">
      <div className="relative w-full max-w-lg rounded-3xl border border-white/20 bg-surface p-6 sm:p-7 shadow-2xl max-h-[95vh] overflow-y-auto">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 rounded-full bg-white/10 p-2 text-gray-400 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-black uppercase tracking-wider text-emerald-400 mb-2">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Account Active • Welcome {user ? user.name : ""}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            Movies & TV Series Request කරන්නේ මෙහෙමයි 🎬
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            පහත සරල පියවර 3 අනුගමනය කර ඕනෑම Movie එකක් Direct WhatsApp Group එකටම ගෙන්නගන්න!
          </p>
        </div>

        {/* Steps Walkthrough */}
        <div className="space-y-3.5 mb-6">
          {/* Step 1 */}
          <div className="flex items-start gap-3.5 rounded-2xl border border-white/10 bg-black/60 p-3.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-black font-black text-sm">
              1
            </div>
            <div className="text-xs">
              <p className="font-bold text-white flex items-center gap-1.5">
                <Search className="h-3.5 w-3.5 text-gray-400" />
                <span>Movie හෝ TV Series එක තෝරන්න</span>
              </p>
              <p className="text-gray-400 mt-0.5">
                Search bar එකෙන් ඔබ කැමති චිත්‍රපටය සොයා దాని detail page එකට යන්න.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-start gap-3.5 rounded-2xl border border-white/10 bg-black/60 p-3.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-black font-black text-sm">
              2
            </div>
            <div className="text-xs">
              <p className="font-bold text-white flex items-center gap-1.5">
                <DownloadCloud className="h-3.5 w-3.5 text-gray-400" />
                <span>Quality එක (1080p / 720p / 480p) තෝරන්න</span>
              </p>
              <p className="text-gray-400 mt-0.5">
                TV Series නම් Season එක සහ Quality එක තෝරා &ldquo;Request to WhatsApp&rdquo; ඔබන්න.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex items-start gap-3.5 rounded-2xl border border-white/10 bg-black/60 p-3.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-black font-black text-sm">
              3
            </div>
            <div className="text-xs">
              <p className="font-bold text-white flex items-center gap-1.5">
                <MessageSquare className="h-3.5 w-3.5 text-emerald-400" />
                <span>WhatsApp එකට Message එක Send කරන්න</span>
              </p>
              <p className="text-gray-400 mt-0.5">
                WhatsApp Bot (+94 76 037 2547) ස්වයංක්‍රීයව විනාඩි කිහිපයකින් Sinhala Subtitles සමඟ Group එකට Upload කරනු ලැබේ!
              </p>
            </div>
          </div>
        </div>

        {/* Quota Reminder */}
        <div className="rounded-2xl border border-white/10 bg-surface/80 p-3.5 text-xs text-gray-300 flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Film className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>ඔබේ දෛනික Quota එක:</span>
          </div>
          <span className="font-bold text-white font-mono">6 Movies • 1 Full Series Pack</span>
        </div>

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="w-full flex items-center justify-center gap-2 rounded-2xl bg-white py-4 px-6 text-sm font-black text-black shadow-glow-white hover:bg-gray-100 transition-all active:scale-98"
        >
          <CheckCircle2 className="h-5 w-5 fill-black text-white" />
          <span>හරි මට තේරුණා (START EXPLORING)</span>
        </button>
      </div>
    </div>
  );
};
