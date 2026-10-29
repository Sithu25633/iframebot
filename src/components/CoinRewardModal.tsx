"use client";

import React, { useState, useEffect } from "react";
import { getCurrentUser, updateLocalUserCoins } from "@/lib/userState";
import {
  Coins,
  Sparkles,
  Play,
  Clock,
  CheckCircle,
  X,
  PlusCircle,
  Film,
  Tv,
} from "lucide-react";

interface CoinRewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCoinsEarned?: (newBalance: number) => void;
}

export const CoinRewardModal: React.FC<CoinRewardModalProps> = ({
  isOpen,
  onClose,
  onCoinsEarned,
}) => {
  const [coins, setCoins] = useState(50);
  const [timerActive, setTimerActive] = useState(false);
  const [timer, setTimer] = useState(12);
  const [claimed, setClaimed] = useState(false);

  useEffect(() => {
    const user = getCurrentUser();
    if (user) setCoins(user.coins);
  }, [isOpen]);

  useEffect(() => {
    let interval: any = null;
    if (timerActive && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0 && timerActive) {
      setTimerActive(false);
      handleRewardClaim();
    }
    return () => clearInterval(interval);
  }, [timerActive, timer]);

  if (!isOpen) return null;

  const handleWatchAd = () => {
    // Open Adsterra link in new tab
    window.open("https://pl31721006.profitableratecpmnetwork.com/85/1c/a4/851ca45e64bf48597a884931231569f0.js", "_blank");
    setTimer(12);
    setTimerActive(true);
    setClaimed(false);
  };

  const handleRewardClaim = async () => {
    const user = getCurrentUser();
    const newBal = (user ? user.coins : coins) + 50;
    setCoins(newBal);
    updateLocalUserCoins(newBal);
    setClaimed(true);

    if (user) {
      try {
        await fetch("/api/user/coins", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.id, delta: 50, reason: "ad_reward" }),
        });
      } catch (e) {}
    }

    if (onCoinsEarned) onCoinsEarned(newBal);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn text-white">
      <div className="relative w-full max-w-md rounded-3xl border border-white/20 bg-surface p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-full bg-white/10 p-2 text-gray-400 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Current Balance Display */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-amber-400 text-black shadow-lg mb-3">
            <Coins className="h-8 w-8" />
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-0.5 text-xs font-black uppercase tracking-wider text-amber-400 mb-1">
            <span>FilmFeed Coin Vault</span>
          </div>
          <h2 className="text-3xl font-black text-white">{coins} <span className="text-sm font-normal text-gray-400">Coins</span></h2>
          <p className="text-xs text-gray-400 mt-1">ඔබේ වත්මන් FilmFeed Coin ශේෂය</p>
        </div>

        {/* Rules & Pricing card */}
        <div className="mb-5 rounded-2xl border border-white/10 bg-black/60 p-4 space-y-2 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-white/10 text-gray-400">
            <span>Daily Free Allowances</span>
            <span className="font-bold text-white">Cost after limit</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-gray-300">
              <Film className="h-3.5 w-3.5 text-white" />
              <span>Movies (Max 6 Free/day)</span>
            </span>
            <span className="font-bold font-mono text-amber-400">50 Coins / req</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-gray-300">
              <Tv className="h-3.5 w-3.5 text-white" />
              <span>TV Series (1 Free Season/day)</span>
            </span>
            <span className="font-bold font-mono text-amber-400">100 Coins / req</span>
          </div>
        </div>

        {/* Action Button: Earn Coins */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={handleWatchAd}
            disabled={timerActive}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-white py-4 px-6 text-sm font-black text-black shadow-glow-white hover:bg-gray-200 disabled:opacity-50 transition-all active:scale-95"
          >
            <PlusCircle className="h-5 w-5" />
            <span>EARN +50 COINS (WATCH / CLICK AD)</span>
          </button>

          {timerActive && (
            <div className="flex items-center justify-center gap-2 rounded-xl bg-white/10 p-3 text-xs text-gray-300">
              <Clock className="h-4 w-4 animate-spin text-white" />
              <span>Verifying sponsor ad... <b className="text-white">{timer}s</b> remaining</span>
            </div>
          )}

          {claimed && (
            <div className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500/20 border border-emerald-500/30 p-3 text-xs text-emerald-400 font-bold">
              <CheckCircle className="h-4 w-4" />
              <span>🎉 +50 Coins ඔබගේ ගිණුමට සාර්ථකව එකතු විය!</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
