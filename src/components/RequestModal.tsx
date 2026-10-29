"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MovieDetail, SeriesEpisode } from "@/lib/cinesubz";
import { getVipStatus } from "@/lib/vip";
import {
  getCurrentUser,
  getDailyUsage,
  incrementUsage,
  updateLocalUserCoins,
  UserProfile,
} from "@/lib/userState";
import { VipShareModal } from "@/components/VipShareModal";
import { AuthModal } from "@/components/AuthModal";
import { CoinRewardModal } from "@/components/CoinRewardModal";
import {
  MessageSquare,
  Sparkles,
  X,
  Tv,
  Film,
  Crown,
  CheckCircle2,
  Coins,
  ShieldCheck,
  Check,
  AlertTriangle,
} from "lucide-react";

interface RequestModalProps {
  movie: MovieDetail;
  isOpen: boolean;
  onClose: () => void;
  botPhone?: string;
  initialQuality?: string;
  initialSeason?: number;
}

export const RequestModal: React.FC<RequestModalProps> = ({
  movie,
  isOpen,
  onClose,
  botPhone,
  initialQuality = "720p",
  initialSeason,
}) => {
  const isSeries = movie.kind === "series" || (movie.episodes && movie.episodes.length > 0);
  const targetBotPhone = botPhone || "94760372547";

  // Group episodes by season
  const seasonsMap: { [key: number]: SeriesEpisode[] } = {};
  if (isSeries && movie.episodes) {
    movie.episodes.forEach((ep) => {
      if (!seasonsMap[ep.season]) seasonsMap[ep.season] = [];
      seasonsMap[ep.season].push(ep);
    });
  }
  const availableSeasons = Object.keys(seasonsMap).map(Number).sort((a, b) => a - b);
  const defaultSeason = initialSeason || (availableSeasons.length > 0 ? availableSeasons[0] : 1);

  const [selectedSeason, setSelectedSeason] = useState<number>(defaultSeason);
  const [selectedQuality, setSelectedQuality] = useState<string>(initialQuality);
  const [requestToken, setRequestToken] = useState("");
  const [isVip, setIsVip] = useState(false);
  const [currentUser, setProfile] = useState<UserProfile | null>(null);
  const router = useRouter();

  // Modals
  const [isVipModalOpen, setIsVipModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isCoinModalOpen, setIsCoinModalOpen] = useState(false);
  const [authReason, setAuthReason] = useState("");

  const [limitExceeded, setLimitExceeded] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState(false);

  useEffect(() => {
    setIsVip(getVipStatus());
    setProfile(getCurrentUser());
    setLimitExceeded(false);
    setDuplicateWarning(false);
    const token = Math.random().toString(36).substring(2, 8).toUpperCase();
    setRequestToken(token);
    if (initialSeason) setSelectedSeason(initialSeason);
    else if (availableSeasons.length > 0) setSelectedSeason(availableSeasons[0]);
    if (initialQuality) setSelectedQuality(initialQuality);
  }, [isOpen, movie, initialQuality, initialSeason]);

  if (!isOpen) return null;

  const handleRequestClick = async () => {
    const user = getCurrentUser();
    const isGuest = !user;
    const isUserVip = Boolean(user?.isVip || isVip || getVipStatus());
    const usage = getDailyUsage();
    const totalToday = (usage.moviesRequested || 0) + (usage.seriesRequested || 0) + (usage.guestMovieCount || 0);

    // 1. Check daily 6-movie limit for non-VIP users
    if (!isUserVip && totalToday >= 6) {
      setLimitExceeded(true);
      return;
    }

    // 2. Check duplicate movie request
    const lastUrl = typeof window !== "undefined" ? localStorage.getItem("filmfeed_last_requested_movie") : null;
    if (lastUrl && lastUrl === movie.url) {
      setDuplicateWarning(true);
      return;
    }

    if (typeof window !== "undefined") {
      localStorage.setItem("filmfeed_last_requested_movie", movie.url);
    }

    incrementUsage(isSeries ? "series" : "movie", isGuest);

    const userName = user?.name || "Member";
    const userPhone = user?.phone || "Direct";

    const requestUrl = (movie.url || "").replace(/cinesubz\.(net|co)/g, "cinesubz.lk");

    // 4. PROFESSIONAL AESTHETIC WHATSAPP MESSAGE
    const professionalMessage = 
`🎬 ━━━━━━━━━━━━━━━━━━━━━━
   *FILMFEED 4K • OFFICIAL REQUEST*
━━━━━━━━━━━━━━━━━━━━━━ 🎬

🍿 *Content:* ${movie.title}
📦 *Type:* ${isSeries ? `TV Series (Season ${selectedSeason} Pack)` : "4K Ultra HD Movie"}
📺 *Quality:* ${selectedQuality}
🔑 *Security Token:* #${requestToken}

👤 *REQUESTER DETAILS:*
• Name: ${userName}
• Status: ${isGuest ? "Guest Member (1st Free Request)" : isUserVip ? "👑 VIP Member (Unlimited)" : "Verified Google Member ⭐"}
• WhatsApp: ${userPhone}
• Security: Single-Device Verified ✅

⚡ *Request Source:* FilmFeed 4K Hub
🌐 *Hub URL:* https://web-umber-six-e1un7z6257.vercel.app

━━━━━━━━━━━━━━━━━━━━━━
${isSeries ? `!req_season ${movie.url} | S${selectedSeason} | ${selectedQuality} | ${requestToken}` : `!req ${requestUrl} | ${selectedQuality} | ${requestToken}`}`;

    // 5. Log Request to Cloud Firestore
    try {
      await fetch("/api/admin/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id || "",
          userName: user?.name || "Guest User",
          userPhone: user?.phone || "Guest",
          title: movie.title,
          type: isSeries ? "series" : "movie",
          season: isSeries ? selectedSeason : undefined,
          quality: selectedQuality,
          token: requestToken,
          status: "completed",
        }),
      });
    } catch (e) {}

    // 6. Save payload and route to /verify with 10s countdown & high viewability ads
    const requestPayload = {
      title: movie.title,
      poster: movie.poster || "",
      url: movie.url,
      type: isSeries ? "series" : "movie",
      season: isSeries ? selectedSeason : undefined,
      quality: selectedQuality,
      token: requestToken,
      userName,
      userPhone,
      isVip: isUserVip,
      botPhone: targetBotPhone,
      message: professionalMessage,
    };

    if (typeof window !== "undefined") {
      sessionStorage.setItem("filmfeed_verify_request", JSON.stringify(requestPayload));
    }

    onClose();

    const searchParams = new URLSearchParams({
      title: movie.title,
      type: isSeries ? "series" : "movie",
      season: isSeries ? String(selectedSeason) : "1",
      quality: selectedQuality,
      token: requestToken,
      url: movie.url,
      botPhone: targetBotPhone,
      poster: movie.poster || "",
    });

    router.push(`/verify?${searchParams.toString()}`);
  };

  const usage = getDailyUsage();
  const user = currentUser;

  const qualityOptions = [
    {
      id: "1080p",
      label: "1080p Full HD",
      desc: "Ultra Crisp • Crystal Clear (1.2GB - 1.9GB)",
      badge: "BEST QUALITY",
    },
    {
      id: "720p",
      label: "720p HD Ready",
      desc: "Balanced Quality • Fast Download (700MB - 1GB)",
      badge: "RECOMMENDED",
    },
    {
      id: "480p",
      label: "480p SD Mobile",
      desc: "Lightweight • Data Saver (350MB - 500MB)",
      badge: "SUPER FAST",
    },
  ];

  return (
    <>
      <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn text-white">
        <div className="relative w-full max-w-lg rounded-3xl border border-white/20 bg-surface p-6 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 rounded-full bg-white/10 p-2 text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          {limitExceeded ? (
            <div className="py-6 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <AlertTriangle className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-black text-white mb-2">Daily Free Limit Reached (6/6 Movies)</h3>
              <p className="text-sm font-bold text-amber-300 mb-3">දෛනික නොමිලේ චිත්‍රපට 6 ක සීමාව සම්පූර්ණයි!</p>
              <p className="text-xs text-gray-300 leading-relaxed max-w-sm mx-auto mb-6">
                ඔබ අද දිනට හිමි නොමිලේ චිත්‍රපට 6 ක උපරිම සීමාව ලබාගෙන ඇත. හෙට මධ්‍යම රාත්‍රියෙන් පසු නැවත නොමිලේ චිත්‍රපට ලබාගත හැක. නැතහොත් දැන්ම VIP සාමාජිකත්වය ලබාගෙන <b>අසීමිතව (Unlimited)</b> චිත්‍රපට ලබාගන්න!
              </p>
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => setIsVipModalOpen(true)}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 py-3.5 px-6 text-sm font-black text-black shadow-lg hover:from-amber-300 hover:to-amber-400 transition-all"
                >
                  <Crown className="h-4 w-4" />
                  <span>ACTIVATE VIP MEMBERSHIP (UNLIMITED)</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full rounded-2xl bg-white/10 py-3 text-xs font-bold text-gray-300 hover:bg-white/20 transition-all"
                >
                  Close / පසුවට
                </button>
              </div>
            </div>
          ) : duplicateWarning ? (
            <div className="py-6 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
                <AlertTriangle className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-black text-white mb-2">Duplicate Request Warning</h3>
              <p className="text-sm font-bold text-rose-300 mb-3">එකම චිත්‍රපටය නැවත Request කිරීම තහනම්ය!</p>
              <p className="text-xs text-gray-300 leading-relaxed max-w-sm mx-auto mb-6">
                ඔබ මෙම චිත්‍රපටය මීට සුළු මොහොතකට පෙරද Request කර ඇත. එකම WhatsApp අංකයෙන් එකම චිත්‍රපටය නැවත නැවතත් Request කළහොත් ඔබගේ ගිණුම ස්වයංක්‍රීයව <b>BAN</b> කරනු ලැබේ. කරුණාකර වෙනත් චිත්‍රපටයක් තෝරාගන්න.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="w-full rounded-2xl bg-white py-3 text-sm font-black text-black hover:bg-gray-100 transition-all"
              >
                තේරුම් ගත්තා (Back to Movies)
              </button>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="flex items-center gap-3 mb-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-black font-black shrink-0">
              {isSeries ? <Tv className="h-6 w-6" /> : <Film className="h-6 w-6" />}
            </div>
            <div className="min-w-0">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/5 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-gray-300">
                <Sparkles className="h-3 w-3" />
                <span>{isSeries ? "TV Series Auto-Pack" : "Movie Request"}</span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-white truncate">
                {movie.title}
              </h3>
            </div>
          </div>

          {/* Season Selector for TV Series */}
          {isSeries && (
            <div className="mb-4 rounded-2xl border border-white/15 bg-black/60 p-4">
              <label className="text-xs font-bold text-white flex items-center justify-between mb-3">
                <span className="flex items-center gap-1.5">
                  <Tv className="h-4 w-4" />
                  <span>1. Select Season to Download</span>
                </span>
                <span className="text-[10px] font-bold text-emerald-400 font-mono">
                  Dual Group Broadcast
                </span>
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {availableSeasons.map((s) => {
                  const epCount = seasonsMap[s]?.length || 0;
                  const isSelected = selectedSeason === s;
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSelectedSeason(s)}
                      className={`flex flex-col items-center justify-center rounded-xl p-2.5 text-xs font-bold transition-all ${
                        isSelected
                          ? "bg-white text-black shadow-glow-white border-2 border-white"
                          : "bg-surface border border-white/10 text-gray-300 hover:border-white/30"
                      }`}
                    >
                      <span className="text-sm font-black">Season {s}</span>
                      <span className={`text-[10px] ${isSelected ? "text-black/70" : "text-gray-400"}`}>
                        {epCount} Episodes
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quality Selector */}
          <div className="mb-4">
            <label className="text-xs font-bold text-white flex items-center justify-between mb-2.5">
              <span>{isSeries ? "2. Select Video Quality for All Episodes" : "Select Video Quality"}</span>
              <span className="text-[10px] font-mono text-gray-400">Sinhala Subtitles Included</span>
            </label>

            <div className="space-y-2">
              {qualityOptions.map((opt) => {
                const isSelected =
                  selectedQuality.toLowerCase().includes(opt.id) ||
                  selectedQuality === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSelectedQuality(opt.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? "bg-white text-black border-white shadow-glow-white"
                        : "bg-black/60 border-white/10 hover:border-white/30 text-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-6 w-6 items-center justify-center rounded-full border ${
                          isSelected
                            ? "border-black bg-black text-white"
                            : "border-white/30 bg-white/5 text-transparent"
                        }`}
                      >
                        <Check className="h-3.5 w-3.5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-black">{opt.label}</span>
                          <span
                            className={`rounded px-1.5 py-0.2 text-[9px] font-black uppercase ${
                              isSelected
                                ? "bg-black text-white"
                                : "bg-white/10 text-gray-300"
                            }`}
                          >
                            {opt.badge}
                          </span>
                        </div>
                        <p className={`text-[11px] mt-0.5 ${isSelected ? "text-black/70" : "text-gray-400"}`}>
                          {opt.desc}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quota & User Info Box */}
          <div className="mb-5 rounded-2xl border border-white/10 bg-black/60 p-3.5 text-xs space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Account:</span>
              <span className="font-bold text-white flex items-center gap-1.5">
                {user ? (
                  <>
                    <span>{user.name}</span>
                    <span className="text-[10px] text-amber-400 font-mono">({user.coins || 0} Coins)</span>
                  </>
                ) : (
                  <span className="text-amber-400">Guest (1 Movie Trial Only)</span>
                )}
              </span>
            </div>
            {user && (
              <div className="flex justify-between">
                <span className="text-gray-400">Daily Free Quota:</span>
                <span className="font-mono text-white">
                  {isSeries ? `${usage.seriesRequested}/1 Series Free` : `${usage.moviesRequested}/6 Movies Free`}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-400">Target Resolution:</span>
              <span className="font-mono font-bold text-white uppercase">{selectedQuality}</span>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={handleRequestClick}
            className="w-full flex flex-col items-center justify-center gap-1 rounded-2xl bg-white py-3.5 px-6 text-black shadow-glow-white hover:bg-gray-100 active:scale-98 transition-all"
          >
            <div className="flex items-center gap-2 text-sm sm:text-base font-black">
              <Sparkles className="h-5 w-5 fill-black" />
              <span>CONTINUE TO VERIFY &amp; GET MOVIE ⚡</span>
            </div>
            <span className="text-[10px] text-gray-600 font-medium">
              (10s high-speed verification unlocks direct WhatsApp download)
            </span>
          </button>
            </>
          )}
        </div>
      </div>

      {/* Auth Modal for 2nd movie or TV Series */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        reason={authReason}
        onSuccess={(u) => {
          setProfile(u);
          setIsAuthModalOpen(false);
        }}
      />

      {/* VIP Modal */}
      <VipShareModal
        isOpen={isVipModalOpen}
        onClose={() => setIsVipModalOpen(false)}
        onVipActivated={() => {
          setIsVip(true);
          setIsVipModalOpen(false);
        }}
        seriesTitle={movie.title}
      />

      {/* Coin Reward Modal */}
      <CoinRewardModal
        isOpen={isCoinModalOpen}
        onClose={() => setIsCoinModalOpen(false)}
        onCoinsEarned={(bal) => {
          if (currentUser) setProfile({ ...currentUser, coins: bal });
        }}
      />
    </>
  );
};
