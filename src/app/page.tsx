"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { SearchBar } from "@/components/SearchBar";
import { MovieCard } from "@/components/MovieCard";
import { AdBanner } from "@/components/AdBanner";
import { VipShareModal } from "@/components/VipShareModal";
import { MovieSearchResult } from "@/lib/cinesubz";
import {
  Film,
  Tv,
  Crown,
  Play,
  Flame,
  AlertCircle,
  TrendingUp,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";

export type TabType = "movies" | "series";

interface TabDefinition {
  id: TabType;
  label: string;
  subLabel: string;
  badge: string;
  icon: React.ComponentType<{ className?: string }>;
  titleText: string;
  subCategories: { id: string; name: string }[];
}

const TABS: TabDefinition[] = [
  {
    id: "movies",
    label: "Movies",
    subLabel: "චිත්‍රපට",
    badge: "4K UHD",
    icon: Film,
    titleText: "🎬 4K UHD Movies • නවතම චිත්‍රපට",
    subCategories: [
      { id: "All", name: "All Movies (සියල්ල)" },
      { id: "action", name: "Action (ක්‍රියාදාම)" },
      { id: "horror", name: "Horror (භීතිජනක)" },
      { id: "scifi", name: "Sci-Fi (විද්‍යා ප්‍රබන්ධ)" },
      { id: "comedy", name: "Comedy (හාස්‍ය)" },
      { id: "romance", name: "Romance (ආදර)" },
      { id: "thriller", name: "Thriller (ත්‍රාසජනක)" },
      { id: "crime", name: "Crime (අපරාධ)" },
      { id: "mystery", name: "Mystery (අභිරහස්)" },
      { id: "animation", name: "Animation (ඇනිමේෂන්)" },
      { id: "adventure", name: "Adventure (ත්‍රාසජනක සංචාර)" },
      { id: "drama", name: "Drama (නාට්‍යමය)" },
    ],
  },
  {
    id: "series",
    label: "TV Series",
    subLabel: "කතාමාලා",
    badge: "Full Seasons",
    icon: Tv,
    titleText: "📺 TV Series • සම්පූර්ණ කතාමාලා (Full Seasons)",
    subCategories: [
      { id: "All", name: "All Series (සියල්ල)" },
      { id: "korean-drama", name: "Korean Dramas (කොරියානු)" },
      { id: "english", name: "English Series (ඉංග්‍රීසි)" },
      { id: "action", name: "Action & Crime (ක්‍රියාදාම)" },
      { id: "scifi", name: "Sci-Fi & Fantasy (විද්‍යා ප්‍රබන්ධ)" },
      { id: "horror", name: "Horror & Thriller (භීතිජනක)" },
      { id: "drama", name: "Drama & Mystery (නාට්‍යමය)" },
      { id: "romance", name: "Romance (ආදර)" },
      { id: "comedy", name: "Comedy (හාස්‍ය)" },
    ],
  },
];

const VALID_TABS: TabType[] = ["movies", "series"];

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<TabType>("movies");
  const [activeSubCat, setActiveSubCat] = useState<string>("All");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [movies, setMovies] = useState<MovieSearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchActive, setSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isVipModalOpen, setIsVipModalOpen] = useState(false);

  const currentTabDef = TABS.find((t) => t.id === activeTab) || TABS[0];

  const fetchItems = useCallback(
    async (tab: TabType, page: number = 1, subCat: string = "All") => {
      setLoading(true);
      setSearchActive(false);
      setSearchQuery("");

      try {
        let endpoint = "";
        const cleanSub = subCat === "All" ? "" : subCat;

        if (tab === "movies") {
          endpoint = cleanSub
            ? `/api/latest?genre=${encodeURIComponent(cleanSub)}&page=${page}`
            : `/api/latest?page=${page}`;
        } else {
          endpoint = cleanSub
            ? `/api/series?genre=${encodeURIComponent(cleanSub)}&page=${page}`
            : `/api/series?page=${page}`;
        }

        const res = await fetch(endpoint);
        const data = await res.json();

        let items: MovieSearchResult[] = [];
        let totalP = 1;

        if (tab === "movies") {
          items = data.movies || [];
          totalP = data.totalPages || 50;
        } else {
          items = data.series || [];
          totalP = data.totalPages || 30;
        }

        setMovies(items);
        setTotalPages(totalP);
        setCurrentPage(page);
      } catch (e) {
        console.error("Failed to load content:", e);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Parse URL on load
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tabParam = (params.get("tab") || params.get("cat")) as TabType;
      const subParam = params.get("sub");
      const pageParam = parseInt(params.get("page") || "1", 10);

      const targetTab: TabType = tabParam === "series" ? "series" : "movies";
      const targetSub = subParam || "All";
      const targetPage = !isNaN(pageParam) && pageParam > 0 ? pageParam : 1;

      setActiveTab(targetTab);
      setActiveSubCat(targetSub);
      setCurrentPage(targetPage);
      fetchItems(targetTab, targetPage, targetSub);
    }
  }, [fetchItems]);

  // Listen for VIP modal event
  useEffect(() => {
    const handler = () => setIsVipModalOpen(true);
    window.addEventListener("open-vip-modal", handler);
    return () => window.removeEventListener("open-vip-modal", handler);
  }, []);

  const handleTabChangeRef = React.useRef<(tab: TabType) => void>(() => {});

  // Listen for navigation events from BottomNav
  useEffect(() => {
    const handler = (e: Event) => {
      const tab = (e as CustomEvent<{ tab: TabType }>).detail?.tab;
      if (tab) handleTabChangeRef.current(tab);
    };
    window.addEventListener("filmfeed-navigate", handler);
    return () => window.removeEventListener("filmfeed-navigate", handler);
  }, []);

  const handleTabChange = (newTab: TabType) => {
    setActiveTab(newTab);
    setActiveSubCat("All");
    setCurrentPage(1);

    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", newTab);
      url.searchParams.set("page", "1");
      url.searchParams.delete("sub");
      window.history.pushState({}, "", url.toString());
      window.dispatchEvent(new CustomEvent("filmfeed-tab-change"));
    }

    fetchItems(newTab, 1, "All");
  };

  handleTabChangeRef.current = handleTabChange;

  const handleSubCatChange = (newSub: string) => {
    setActiveSubCat(newSub);
    setCurrentPage(1);

    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", activeTab);
      url.searchParams.set("page", "1");
      if (newSub !== "All") url.searchParams.set("sub", newSub);
      else url.searchParams.delete("sub");
      window.history.pushState({}, "", url.toString());
    }

    fetchItems(activeTab, 1, newSub);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages || newPage === currentPage) return;
    setCurrentPage(newPage);

    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", activeTab);
      url.searchParams.set("page", String(newPage));
      if (activeSubCat !== "All") url.searchParams.set("sub", activeSubCat);
      window.history.pushState({}, "", url.toString());
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    fetchItems(activeTab, newPage, activeSubCat);
  };

  const handleSearch = async (q: string) => {
    if (!q || !q.trim()) {
      fetchItems(activeTab, currentPage, activeSubCat);
      return;
    }
    setSearchQuery(q);
    setSearchActive(true);
    setLoading(true);

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q.trim())}`);
      const data = await res.json();
      setMovies(data.results || []);
      setTotalPages(1);
      setCurrentPage(1);
    } catch (e) {
      console.error("Search error", e);
    } finally {
      setLoading(false);
    }
  };

  const featuredItem = movies.length > 0 ? movies[0] : null;

  return (
    <div className="min-h-screen bg-[#090a0f] text-white selection:bg-red-600 selection:text-white">
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 pb-24 space-y-6">
        
        {/* Top Control Bar: Search & Tab Switcher */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Main Segmented Switcher (Movies vs TV Series) */}
          <div className="inline-flex items-center p-1 rounded-xl bg-[#13151f] border border-white/[0.08] shadow-inner self-start">
            <button
              onClick={() => handleTabChange("movies")}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === "movies"
                  ? "bg-red-600 text-white shadow-md shadow-red-600/30"
                  : "text-gray-400 hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              <Film className="h-4 w-4" />
              <span>Movies (චිත්‍රපට)</span>
            </button>
            <button
              onClick={() => handleTabChange("series")}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === "series"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                  : "text-gray-400 hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              <Tv className="h-4 w-4" />
              <span>TV Series (කතාමාලා)</span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="flex-1 sm:max-w-md">
            <SearchBar
              onSearchSubmit={handleSearch}
              initialQuery={searchQuery}
              onCategorySelect={(cat) => {
                if (cat === "series" || cat === "movies") {
                  handleTabChange(cat);
                }
              }}
            />
          </div>
        </div>

        {/* Stream Banner */}
        <div className="relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/40 via-[#0c1615] to-[#0a1219] p-4 sm:p-5 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300 uppercase tracking-wider">
                    NEW FEATURE • 100% AD-FREE
                  </span>
                  <span className="text-[11px] text-gray-400">8h Temporary Session</span>
                </div>
                <h3 className="text-sm font-bold text-white mt-1">
                  Online Iframe Web Player — Ultra High-Speed Streaming
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Click any movie and press <span className="text-emerald-400 font-semibold">&ldquo;Request Online Iframe Web&rdquo;</span> to watch instantly with zero ads, zero buffering, and full embed code!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Categories / Genre Filter Chips */}
        {!searchActive && currentTabDef.subCategories.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 shrink-0 mr-1">
              <Filter className="h-3.5 w-3.5 text-red-500" />
              <span>Genres:</span>
            </div>
            {currentTabDef.subCategories.map((sub) => {
              const isSelected = activeSubCat.toLowerCase() === sub.id.toLowerCase();
              return (
                <button
                  key={sub.id}
                  onClick={() => handleSubCatChange(sub.id)}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all shrink-0 active:scale-95 ${
                    isSelected
                      ? activeTab === "series"
                        ? "bg-blue-600 text-white shadow-md shadow-blue-600/30 font-bold"
                        : "bg-red-600 text-white shadow-md shadow-red-600/30 font-bold"
                      : "bg-[#13151f] border border-white/[0.06] text-gray-300 hover:text-white hover:border-white/20 hover:bg-[#1a1d2b]"
                  }`}
                >
                  {sub.name}
                </button>
              );
            })}
          </div>
        )}

        {/* TOP AD BANNER */}
        <AdBanner position="top" />

        {/* FEATURED SPOTLIGHT HERO CARD */}
        {!searchActive && featuredItem && !loading && currentPage === 1 && (
          <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-r from-[#12141c] via-[#0f1118] to-black p-6 sm:p-8 shadow-2xl">
            <div className="absolute right-0 top-0 h-full w-full sm:w-2/3 opacity-25 pointer-events-none overflow-hidden">
              <img
                src={featuredItem.poster}
                alt=""
                className="h-full w-full object-cover blur-sm scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#12141c] via-[#12141c]/80 to-transparent" />
            </div>

            <div className="relative z-10 max-w-xl space-y-3.5">
              <div className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-600/10 px-3 py-1 text-xs font-bold text-red-400">
                <Flame className="h-3.5 w-3.5 text-red-500" />
                <span className="uppercase tracking-wide">
                  TRENDING NOW • {activeTab === "series" ? "TV SERIES" : "CINEMA 4K"}
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
                {featuredItem.title.replace(/\s*\(?\d{4}\)?\s*Sinhala.*$/i, "").trim()}
              </h1>

              <div className="flex flex-wrap items-center gap-3 text-xs text-gray-300 font-medium">
                <span className="rounded bg-white/10 px-2 py-0.5 text-white font-bold">
                  {featuredItem.year || "2026"}
                </span>
                <span className={`rounded px-2 py-0.5 font-bold ${activeTab === "series" ? "bg-blue-600 text-white" : "bg-red-600 text-white"}`}>
                  {featuredItem.quality || (activeTab === "series" ? "Full Season" : "4K UHD")}
                </span>
                {featuredItem.rating && (
                  <span className="text-amber-400 font-bold">⭐ {featuredItem.rating}</span>
                )}
                <span className="text-emerald-400 font-semibold">• Sinhala Subtitles Included</span>
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <Link
                  href={`/movie?url=${encodeURIComponent(featuredItem.url)}`}
                  className="inline-flex items-center gap-2 rounded-xl bg-red-600 hover:bg-red-700 px-6 py-2.5 text-xs font-bold text-white transition-all shadow-lg shadow-red-600/30 active:scale-95"
                >
                  <Play className="h-4 w-4 fill-white" />
                  <span>WATCH &amp; REQUEST NOW</span>
                </Link>
                <button
                  onClick={() => setIsVipModalOpen(true)}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.06] hover:bg-white/[0.12] px-4 py-2.5 text-xs font-bold text-white transition-all active:scale-95"
                >
                  <Crown className="h-4 w-4 text-amber-400" />
                  <span>VIP PASS</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SECTION HEADER */}
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
          <div className="flex items-center gap-2.5">
            <div className={`flex h-8 w-8 items-center justify-center rounded-lg text-white font-black ${activeTab === "series" ? "bg-blue-600/20 text-blue-400" : "bg-red-600/20 text-red-500"}`}>
              <TrendingUp className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                {searchActive ? `🔍 Search Results for "${searchQuery}"` : currentTabDef.titleText}
              </h2>
              <p className="text-xs text-gray-400">
                {searchActive
                  ? `Found ${movies.length} matches`
                  : `Showing ${currentTabDef.label} • Category: ${activeSubCat} (Page ${currentPage} of ${totalPages})`}
              </p>
            </div>
          </div>

          {!searchActive && totalPages > 1 && (
            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400">
              <span className="rounded-md bg-white/[0.05] px-2.5 py-1 border border-white/10">
                Page {currentPage}/{totalPages}
              </span>
            </div>
          )}
        </div>

        {/* CONTENT GRID */}
        {loading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {Array.from({ length: 18 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[2/3] rounded-xl bg-[#11131a] border border-white/[0.05] animate-pulse"
              />
            ))}
          </div>
        ) : movies.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {movies.map((item, idx) => (
              <MovieCard key={item.id || item.url || idx} movie={item} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-white/10 rounded-2xl bg-[#11131a]/50">
            <AlertCircle className="h-10 w-10 text-gray-500 mb-3" />
            <h3 className="text-base font-bold text-white mb-1">No titles found</h3>
            <p className="text-xs text-gray-400 max-w-sm mb-4">
              {searchActive
                ? `No search results for "${searchQuery}". Try a different movie or show name.`
                : `No items available under category "${activeSubCat}".`}
            </p>
            <button
              onClick={() => handleTabChange("movies")}
              className="rounded-xl bg-red-600 px-5 py-2 text-xs font-bold text-white hover:bg-red-700 transition-all shadow-md"
            >
              Browse All Movies
            </button>
          </div>
        )}

        {/* MID-PAGE AD BANNER */}
        <AdBanner position="mid" />

        {/* PAGINATION CONTROLS */}
        {!searchActive && totalPages > 1 && (
          <div className="flex flex-wrap items-center justify-center gap-2 pt-6 pb-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className={`flex items-center gap-1 rounded-lg px-4 py-2 text-xs font-bold transition-all ${
                currentPage <= 1
                  ? "bg-white/[0.02] text-gray-600 border border-white/[0.04] cursor-not-allowed"
                  : "bg-[#13151f] border border-white/10 text-white hover:bg-white/10 active:scale-95"
              }`}
            >
              <ChevronLeft className="h-4 w-4" />
              <span>PREV</span>
            </button>

            {Array.from({ length: Math.min(totalPages, 7) }).map((_, i) => {
              let pageNum = i + 1;
              if (totalPages > 7) {
                if (currentPage > 4) {
                  pageNum = currentPage - 3 + i;
                  if (pageNum > totalPages) pageNum = totalPages - (6 - i);
                }
              }

              const isCurrent = currentPage === pageNum;

              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`h-9 w-9 rounded-lg text-xs font-bold transition-all ${
                    isCurrent
                      ? activeTab === "series"
                        ? "bg-blue-600 text-white shadow-md shadow-blue-600/30 scale-105"
                        : "bg-red-600 text-white shadow-md shadow-red-600/30 scale-105"
                      : "bg-[#13151f] border border-white/[0.08] text-gray-300 hover:border-white/30 hover:bg-white/10"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className={`flex items-center gap-1 rounded-lg px-4 py-2 text-xs font-bold transition-all ${
                currentPage >= totalPages
                  ? "bg-white/[0.02] text-gray-600 border border-white/[0.04] cursor-not-allowed"
                  : "bg-[#13151f] border border-white/10 text-white hover:bg-white/10 active:scale-95"
              }`}
            >
              <span>NEXT</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* BOTTOM AD BANNER */}
        <AdBanner position="bottom" />
      </main>

      {/* Modals */}
      <VipShareModal
        isOpen={isVipModalOpen}
        onClose={() => setIsVipModalOpen(false)}
        onVipActivated={() => {
          alert("🎉 VIP Pass Active!");
        }}
      />
    </div>
  );
}
