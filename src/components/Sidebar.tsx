"use client";

import React from "react";
import { Film, Tv, Mic, Globe, Swords, Tv2, Crown, ChevronRight } from "lucide-react";
import type { TabType } from "@/app/page";

interface NavItem {
  id: TabType;
  label: string;
  subLabel: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { id: "movies", label: "Movies", subLabel: "චිත්‍රපට • 4K UHD", icon: Film },
  { id: "series", label: "TV Series", subLabel: "කතාමාලා • Full Seasons", icon: Tv },
];

export interface SidebarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const handleVipClick = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("open-vip-modal"));
    }
  };

  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-[220px] hidden lg:flex flex-col bg-zinc-900 border-r border-white/10 overflow-y-auto z-30 py-4">
      {/* Logo / Tagline */}
      <div className="px-5 pb-4 border-b border-white/10 mb-2">
        <div className="font-black text-white text-base tracking-tight">
          FILMFEED
          <span className="ml-1.5 rounded bg-rose-600 px-1.5 py-0.5 text-[9px] font-black text-white align-middle">
            4K
          </span>
        </div>
        <p className="text-[10px] text-zinc-500 mt-0.5">Your Sinhala 4K Hub</p>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-2 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <div key={item.id}>
              <button
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-rose-600/15 border-l-2 border-rose-600 text-white pl-[10px]"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-800 border-l-2 border-transparent"
                }`}
              >
                <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-rose-400" : "text-zinc-500 group-hover:text-white"}`} />
                <div className="flex flex-col text-left min-w-0">
                  <span className="text-xs leading-none truncate">{item.label}</span>
                  <span className={`text-[10px] font-normal mt-0.5 truncate ${isActive ? "text-rose-300/70" : "text-zinc-600"}`}>
                    {item.subLabel}
                  </span>
                </div>
                {isActive && <ChevronRight className="h-3 w-3 ml-auto shrink-0 text-red-500" />}
              </button>
            </div>
          );
        })}
      </nav>

      {/* VIP Button at bottom */}
      <div className="px-3 pt-4 border-t border-white/10 mt-2">
        <button
          onClick={handleVipClick}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 transition-all py-2.5 text-xs font-black"
        >
          <Crown className="h-4 w-4" />
          <span>VIP PASS</span>
        </button>
      </div>
    </aside>
  );
};
