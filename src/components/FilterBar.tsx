"use client";

import React from "react";

export interface FilterBarProps {
  genres: string[];
  languages: string[];
  countries: string[];
  activeGenre: string;
  activeLanguage: string;
  activeCountry: string;
  onGenreChange: (g: string) => void;
  onLanguageChange: (l: string) => void;
  onCountryChange: (c: string) => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  genres,
  languages,
  countries,
  activeGenre,
  activeLanguage,
  activeCountry,
  onGenreChange,
  onLanguageChange,
  onCountryChange,
}) => {
  return (
    <div className="flex flex-col gap-3 mb-4">
      {/* Genre chips — horizontally scrollable */}
      <div className="overflow-x-auto no-scrollbar flex gap-2 pb-1">
        <button
          onClick={() => onGenreChange("")}
          className={`shrink-0 rounded-full px-3.5 py-1 text-xs font-bold cursor-pointer transition-all ${
            activeGenre === ""
              ? "bg-rose-600 text-white"
              : "bg-zinc-800 border border-white/10 text-zinc-300 hover:text-white"
          }`}
        >
          All
        </button>
        {genres.map((g) => (
          <button
            key={g}
            onClick={() => onGenreChange(g)}
            className={`shrink-0 rounded-full px-3.5 py-1 text-xs font-bold cursor-pointer transition-all ${
              activeGenre === g
                ? "bg-rose-600 text-white"
                : "bg-zinc-800 border border-white/10 text-zinc-300 hover:text-white"
            }`}
          >
            {g}
          </button>
        ))}
      </div>

      {/* Language + Country dropdowns */}
      <div className="flex gap-3 flex-wrap">
        <select
          value={activeLanguage}
          onChange={(e) => onLanguageChange(e.target.value)}
          className="bg-zinc-800 border border-zinc-700 text-white rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-rose-600 cursor-pointer"
        >
          <option value="">All Languages</option>
          {languages.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>

        <select
          value={activeCountry}
          onChange={(e) => onCountryChange(e.target.value)}
          className="bg-zinc-800 border border-zinc-700 text-white rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-rose-600 cursor-pointer"
        >
          <option value="">All Countries</option>
          {countries.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
