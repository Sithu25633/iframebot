"use client";

import React, { useState } from "react";
import { Search, X, Film, Tv } from "lucide-react";

interface SearchBarProps {
  onSearchSubmit: (query: string) => void;
  initialQuery?: string;
  onCategorySelect?: (cat: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onSearchSubmit,
  initialQuery = "",
  onCategorySelect,
}) => {
  const [query, setQuery] = useState(initialQuery);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearchSubmit(query.trim());
    }
  };

  const handleClear = () => {
    setQuery("");
    onSearchSubmit("");
  };

  const quickTags = [
    { label: "4K Movies", query: "movies", icon: Film },
    { label: "TV Series", query: "series", icon: Tv },
    { label: "Action", query: "Action" },
    { label: "Horror", query: "Horror" },
    { label: "Sci-Fi", query: "Sci-Fi" },
    { label: "Korean Drama", query: "Korean Drama" },
    { label: "Comedy", query: "Comedy" },
  ];

  return (
    <div id="search-box" className="w-full space-y-2.5">
      <form onSubmit={handleSubmit} className="relative w-full">
        <div className="relative flex items-center">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
            <Search className="h-4 w-4" />
          </div>

          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search 4K Movies & TV Series..."
            className="w-full rounded-xl border border-white/[0.08] bg-[#12141c] py-3 pl-11 pr-24 text-sm text-white placeholder-gray-500 transition-all focus:border-red-500 focus:bg-[#161822] focus:outline-none focus:ring-1 focus:ring-red-500/50 shadow-inner"
          />

          <div className="absolute inset-y-0 right-1.5 flex items-center gap-1">
            {query && (
              <button
                type="button"
                onClick={handleClear}
                className="rounded-full p-1 text-gray-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            )}

            <button
              type="submit"
              className="rounded-lg bg-red-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-red-700 transition-colors shadow-sm"
            >
              SEARCH
            </button>
          </div>
        </div>
      </form>

      {/* Horizontal scrollable quick chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
        {quickTags.map((tag, idx) => {
          const Icon = tag.icon;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => {
                if (["movies", "series"].includes(tag.query)) {
                  if (onCategorySelect) onCategorySelect(tag.query);
                } else {
                  setQuery(tag.query);
                  onSearchSubmit(tag.query);
                }
              }}
              className="shrink-0 flex items-center gap-1.5 rounded-full border border-white/[0.06] bg-[#12141c] px-3 py-1 text-[11px] font-medium text-gray-300 hover:border-red-500/40 hover:text-white transition-colors"
            >
              {Icon && <Icon className="h-3 w-3 text-red-500" />}
              <span>{tag.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
