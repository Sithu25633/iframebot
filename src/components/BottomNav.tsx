"use client";

import React, { useState, useEffect } from "react";
import { Film, Tv, Crown, Play } from "lucide-react";
import { VipShareModal } from "@/components/VipShareModal";

type TabType = "movies" | "series";

export const BottomNav: React.FC = () => {
  const [isVipModalOpen, setIsVipModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("movies");

  useEffect(() => {
    const readTab = () => {
      const params = new URLSearchParams(window.location.search);
      const t = params.get("tab") || "movies";
      if (t === "series") setActiveTab("series");
      else setActiveTab("movies");
    };
    readTab();
    window.addEventListener("popstate", readTab);
    window.addEventListener("filmfeed-tab-change", readTab);
    return () => {
      window.removeEventListener("popstate", readTab);
      window.removeEventListener("filmfeed-tab-change", readTab);
    };
  }, []);

  const navigate = (tab: TabType) => {
    setActiveTab(tab);
    window.dispatchEvent(new CustomEvent("filmfeed-navigate", { detail: { tab } }));
  };

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-40 block lg:hidden">
        <div className="mx-auto max-w-sm px-4 pb-3">
          <div className="flex items-center justify-around rounded-2xl border border-white/[0.08] bg-[#11131a]/95 p-1.5 backdrop-blur-md shadow-2xl">
            {/* Movies Button */}
            <button
              onClick={() => navigate("movies")}
              className={`flex-1 flex flex-col items-center gap-1 rounded-xl py-2 transition-all ${
                activeTab === "movies"
                  ? "bg-red-600 text-white font-bold shadow-md shadow-red-600/30"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Film className="h-4 w-4" />
              <span className="text-[10px] font-semibold">Movies</span>
            </button>

            {/* TV Series Button */}
            <button
              onClick={() => navigate("series")}
              className={`flex-1 flex flex-col items-center gap-1 rounded-xl py-2 transition-all ${
                activeTab === "series"
                  ? "bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Tv className="h-4 w-4" />
              <span className="text-[10px] font-semibold">TV Series</span>
            </button>

            {/* Stream 4K Button */}
            <a
              href="/movie/avatar-the-way-of-water"
              className="flex-1 flex flex-col items-center gap-1 rounded-xl py-2 text-red-400 hover:text-white transition-all group"
            >
              <Play className="h-4 w-4 fill-red-500/30 text-red-500 group-hover:fill-red-500" />
              <span className="text-[10px] font-bold text-red-400">Stream 4K</span>
            </a>

            {/* VIP Pass Button */}
            <button
              onClick={() => setIsVipModalOpen(true)}
              className="flex-1 flex flex-col items-center gap-1 rounded-xl py-2 text-amber-400 hover:text-amber-300 transition-all"
            >
              <Crown className="h-4 w-4 text-amber-400" />
              <span className="text-[10px] font-semibold">VIP Pass</span>
            </button>
          </div>
        </div>
      </nav>

      <VipShareModal
        isOpen={isVipModalOpen}
        onClose={() => setIsVipModalOpen(false)}
        onVipActivated={() => {
          alert("🎉 VIP Pass Active! දැන් ඔබට TV Series Season එකක් තෝරා WhatsApp Group එකට Request කළ හැක.");
        }}
      />
    </>
  );
};
