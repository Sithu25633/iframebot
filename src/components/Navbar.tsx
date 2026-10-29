"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Film,
  Tv,
  Crown,
  Coins,
  User,
  LogIn,
  LogOut,
  Menu,
  X,
  Sparkles,
  Flame,
  Mic,
  Swords,
  Tv2,
  ChevronRight,
  Filter,
  Play,
} from "lucide-react";
import { VipShareModal } from "@/components/VipShareModal";
import { CoinRewardModal } from "@/components/CoinRewardModal";
import { AuthModal } from "@/components/AuthModal";
import { getCurrentUser, setCurrentUser, syncUserWithServer, UserProfile } from "@/lib/userState";

export interface NavCategory {
  id: string;
  name: string;
  subLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  subCategories: { id: string; name: string }[];
}

export const MAIN_NAV_CATEGORIES: NavCategory[] = [
  {
    id: "online-streaming",
    name: "Watch Online / 4K Streaming",
    subLabel: "Online Multi-Server Player • 4K UHD",
    icon: Play,
    badge: "LIVE 4K",
    subCategories: [
      { id: "stream-trending", name: "🔥 Trending Hollywood Streams" },
      { id: "stream-movies", name: "🎬 4K Ultra HD Movies Online" },
      { id: "stream-series", name: "📺 TV Shows & Full Seasons" },
    ],
  },
  {
    id: "movies",
    name: "Movies",
    subLabel: "චිත්‍රපට (4K UHD)",
    icon: Film,
    badge: "4K UHD",
    subCategories: [
      { id: "all", name: "All Movies (සියලුම චිත්‍රපට)" },
      { id: "action", name: "Action & Adventure (ක්‍රියාදාම)" },
      { id: "horror", name: "Horror & Mystery (භීතිජනක)" },
      { id: "scifi", name: "Sci-Fi & Fantasy (විද්‍යා ප්‍රබන්ධ)" },
      { id: "thriller", name: "Thriller & Suspense (ත්‍රාසජනක)" },
      { id: "romance", name: "Romance & Drama (ආදරකතා)" },
      { id: "comedy", name: "Comedy & Family (හාස්‍ය)" },
      { id: "crime", name: "Crime & Gangster (අපරාධ)" },
      { id: "animation", name: "Animation & Kids (ඇනිමේෂන්)" },
    ],
  },
  {
    id: "series",
    name: "TV Series",
    subLabel: "කතාමාලා (Full Seasons)",
    icon: Tv,
    badge: "Full Seasons",
    subCategories: [
      { id: "all", name: "All TV Series (සියලුම කතාමාලා)" },
      { id: "korean", name: "Korean Dramas (කොරියානු කතාමාලා)" },
      { id: "english", name: "English Series (ඉංග්‍රීසි කතාමාලා)" },
      { id: "action", name: "Action & Crime (ක්‍රියාදාම)" },
      { id: "scifi", name: "Sci-Fi & Fantasy (විද්‍යා ප්‍රබන්ධ)" },
      { id: "horror", name: "Horror & Thriller (භීතිජනක)" },
      { id: "romance", name: "Romance & Drama (ආදරකතා)" },
      { id: "comedy", name: "Comedy (හාස්‍ය)" },
    ],
  },
];

interface NavbarProps {
  onCategorySelect?: (categoryId: string, subCategoryQuery?: string) => void;
  activeCategory?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onCategorySelect, activeCategory = "movies" }) => {
  const [isVipModalOpen, setIsVipModalOpen] = useState(false);
  const [isCoinModalOpen, setIsCoinModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [expandedNavCategory, setExpandedNavCategory] = useState<string | null>(activeCategory);
  const [currentUser, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    setProfile(getCurrentUser());
    syncUserWithServer().then((u) => {
      if (u) setProfile(u);
    });

    const handleStorage = () => {
      setProfile(getCurrentUser());
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const handleLogout = () => {
    setCurrentUser(null);
    setProfile(null);
    window.location.reload();
  };

  const handleNavClick = (catId: string, subId?: string) => {
    setIsMenuOpen(false);
    if (catId === "online-streaming") {
      if (subId === "stream-series") {
        window.location.href = "/movie/stranger-things";
      } else {
        window.location.href = "/movie/avatar-the-way-of-water";
      }
      return;
    }
    if (onCategorySelect) {
      onCategorySelect(catId, subId && subId !== "all" ? subId : undefined);
    } else if (typeof window !== "undefined") {
      const targetUrl = `/?tab=${catId}${subId && subId !== "all" ? `&sub=${encodeURIComponent(subId)}` : ""}&page=1`;
      window.location.href = targetUrl;
    }
  };


  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-black/90 backdrop-blur-2xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-3 sm:px-6 lg:px-8">
          {/* Logo & Navigation */}
          <div className="flex items-center gap-3 sm:gap-6">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="flex items-center gap-1.5 font-black tracking-tighter text-xl sm:text-2xl text-white">
                <span className="bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                  FILMFEED
                </span>
                <span className="rounded-lg bg-red-600 px-2 py-0.5 text-[10px] font-black text-white shadow-lg shadow-red-600/30">
                  4K
                </span>
              </div>
            </Link>

            {/* Watch Online / 4K Streaming Header Navigation Entry */}
            <Link
              href="/movie/avatar-the-way-of-water"
              className="flex items-center gap-1.5 sm:gap-2 rounded-full border border-red-500/40 bg-red-600/15 px-2.5 sm:px-3.5 py-1.5 text-[10px] sm:text-xs font-black text-white hover:bg-red-600 transition-all shadow-lg shadow-red-600/20 active:scale-95 group"
            >
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              <Play className="h-3 w-3 text-red-400 group-hover:text-white fill-current shrink-0" />
              <span className="tracking-wide hidden md:inline">Watch Online / 4K Streaming</span>
              <span className="tracking-wide md:hidden inline">4K Streaming</span>
            </Link>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Coins Badge */}
            <button
              onClick={() => setIsCoinModalOpen(true)}
              className="flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1.5 text-xs font-black text-amber-400 hover:bg-amber-400/20 transition-all active:scale-95"
            >
              <Coins className="h-4 w-4 animate-pulse" />
              <span>{currentUser ? currentUser.coins : 50}</span>
              <span className="hidden sm:inline text-[10px] font-normal text-amber-400/70">Coins</span>
            </button>

            {/* VIP Pass */}
            <button
              onClick={() => setIsVipModalOpen(true)}
              className="hidden sm:flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-black text-white hover:bg-white hover:text-black transition-all active:scale-95"
            >
              <Crown className="h-4 w-4 text-amber-400" />
              <span>VIP PASS</span>
            </button>

            {/* User Login / Profile Button */}
            {currentUser ? (
              <div className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-bold text-white">
                {currentUser.isVip ? (
                  <Crown className="h-4 w-4 text-amber-400 fill-amber-400" />
                ) : (
                  <User className="h-4 w-4 text-emerald-400" />
                )}
                <span className="max-w-[70px] sm:max-w-[100px] truncate">{currentUser.name}</span>
                {currentUser.isVip && (
                  <span className="rounded bg-amber-400 text-black px-1.5 py-0.5 text-[9px] font-black uppercase">
                    VIP
                  </span>
                )}
                <button
                  onClick={handleLogout}
                  title="Logout"
                  className="ml-1 text-gray-400 hover:text-red-400 transition-colors"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-xs font-black text-black hover:bg-gray-200 transition-all active:scale-95 shadow-md"
              >
                <LogIn className="h-4 w-4" />
                <span>SIGN IN</span>
              </button>
            )}

            {/* HAMBURGER MENU BUTTON (Right End Three Lines) */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle Category Menu"
              className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-white hover:bg-white/20 transition-all active:scale-95 shadow-lg"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* HAMBURGER SIDE DRAWER MENU */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-md animate-fadeIn">
          {/* Backdrop Click */}
          <div className="flex-1" onClick={() => setIsMenuOpen(false)} />

          {/* Side Drawer Content */}
          <div className="relative w-full max-w-md border-l border-white/15 bg-neutral-950 p-6 shadow-2xl overflow-y-auto flex flex-col h-full animate-slideLeft">
            {/* Header inside drawer */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-600 text-white font-black">
                  <Filter className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Categories Navigation</h3>
                  <p className="text-xs text-gray-400">මාතෘකා සහ වර්ගීකරණය</p>
                </div>
              </div>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="rounded-full bg-white/10 p-2 text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Navigation List */}
            <div className="space-y-3 flex-1 overflow-y-auto pr-1">
              {MAIN_NAV_CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isExpanded = expandedNavCategory === cat.id;

                return (
                  <div
                    key={cat.id}
                    className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden transition-all"
                  >
                    {/* Main Item Header */}
                    <button
                      onClick={() => {
                        setExpandedNavCategory(isExpanded ? null : cat.id);
                      }}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-white text-base">{cat.name}</span>
                            {cat.badge && (
                              <span className="rounded-full bg-red-600/30 border border-red-500/40 px-2 py-0.5 text-[10px] font-extrabold text-red-400">
                                {cat.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-400">{cat.subLabel}</p>
                        </div>
                      </div>

                      <ChevronRight
                        className={`h-5 w-5 text-gray-400 transition-transform ${
                          isExpanded ? "rotate-90 text-white" : ""
                        }`}
                      />
                    </button>

                    {/* Subcategories Accordion */}
                    {isExpanded && (
                      <div className="border-t border-white/10 bg-black/40 p-3 space-y-1.5 animate-fadeIn">
                        {cat.subCategories.map((sub) => (
                          <button
                            key={sub.id}
                            onClick={() => handleNavClick(cat.id, sub.id)}
                            className="w-full flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-bold text-gray-300 hover:bg-white/10 hover:text-white transition-all text-left"
                          >
                            <span>{sub.name}</span>
                            <ChevronRight className="h-3.5 w-3.5 text-gray-500" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Quick Action Footer inside Drawer */}
            <div className="pt-5 border-t border-white/10 space-y-2 mt-4">
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  setIsVipModalOpen(true);
                }}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 py-3 text-sm font-black text-black shadow-lg hover:brightness-110 transition-all"
              >
                <Crown className="h-4 w-4" />
                <span>UNLIMITED VIP PASS PASS</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <VipShareModal
        isOpen={isVipModalOpen}
        onClose={() => setIsVipModalOpen(false)}
        onVipActivated={() => {
          alert("🎉 VIP Pass Active!");
        }}
      />

      <CoinRewardModal
        isOpen={isCoinModalOpen}
        onClose={() => setIsCoinModalOpen(false)}
        onCoinsEarned={(newBal) => {
          if (currentUser) setProfile({ ...currentUser, coins: newBal });
        }}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={(u) => setProfile(u)}
      />
    </>
  );
};
