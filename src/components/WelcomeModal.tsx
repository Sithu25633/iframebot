"use client";

import React, { useState, useEffect } from "react";
import { getCurrentUser, getDeviceId } from "@/lib/userState";
import { Check, X, Sparkles, ShieldCheck, Zap, Coins } from "lucide-react";
import { usePathname } from "next/navigation";

export const WelcomeModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Skip inside Admin panel
    if (pathname && pathname.startsWith("/admin")) {
      return;
    }

    const user = getCurrentUser();
    const dismissed = sessionStorage.getItem("filmfeed_welcome_seen");

    if (!user && !dismissed) {
      const timer = setTimeout(() => setIsOpen(true), 600);
      return () => clearTimeout(timer);
    }
  }, [pathname]);

  if (pathname && pathname.startsWith("/admin")) return null;
  if (getCurrentUser()) return null;
  if (!isOpen) return null;

  const handleContinueAsGuest = () => {
    sessionStorage.setItem("filmfeed_welcome_seen", "true");
    setIsOpen(false);
  };

  const handleGoogleLogin = () => {
    const deviceId = getDeviceId();
    const currentPath = window.location.pathname + window.location.search;
    window.location.href = `/api/auth/google?deviceId=${encodeURIComponent(
      deviceId
    )}&returnTo=${encodeURIComponent(currentPath)}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-fadeIn text-white">
      <div className="relative w-full max-w-lg rounded-3xl border border-white/20 bg-surface p-6 sm:p-7 shadow-2xl max-h-[95vh] overflow-y-auto">
        <button
          onClick={handleContinueAsGuest}
          className="absolute top-4 right-4 rounded-full bg-white/10 p-2 text-gray-400 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-5">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs font-black uppercase tracking-wider text-gray-300 mb-2">
            <Sparkles className="h-3.5 w-3.5 text-white" />
            <span>Welcome to FilmFeed 4K</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            Choose Your Access Level
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Google Sign In is 100% Free & gives you daily movie quotas + TV series access.
          </p>
        </div>

        {/* Comparison Matrix */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
          {/* Guest Card */}
          <div className="rounded-2xl border border-white/10 bg-black/50 p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-black text-gray-400 uppercase tracking-wider">
                  Guest Access
                </span>
                <span className="rounded bg-white/10 px-2 py-0.5 text-[9px] font-bold text-gray-400">
                  Trial
                </span>
              </div>

              <ul className="space-y-2.5 text-xs text-gray-300">
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                  <span>1 Free Movie Request</span>
                </li>
                <li className="flex items-center gap-2 text-gray-500">
                  <X className="h-3.5 w-3.5 text-red-500 shrink-0" />
                  <span>No TV Series Access</span>
                </li>
                <li className="flex items-center gap-2 text-gray-500">
                  <X className="h-3.5 w-3.5 text-red-500 shrink-0" />
                  <span>Standard Queue</span>
                </li>
                <li className="flex items-center gap-2 text-gray-500">
                  <X className="h-3.5 w-3.5 text-red-500 shrink-0" />
                  <span>0 Welcome Coins</span>
                </li>
              </ul>
            </div>

            <button
              onClick={handleContinueAsGuest}
              className="mt-4 w-full rounded-xl border border-white/20 bg-surface py-2.5 text-xs font-bold text-gray-300 hover:bg-white/10 hover:text-white transition-all"
            >
              Continue as Guest
            </button>
          </div>

          {/* Google Account Card (Recommended) */}
          <div className="relative rounded-2xl border-2 border-white bg-surface p-4 flex flex-col justify-between shadow-glow-white">
            <div className="absolute -top-2.5 right-4 rounded-full bg-white px-2.5 py-0.5 text-[9px] font-black text-black uppercase tracking-wider">
              Recommended
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1">
                  <span>Google Account</span>
                </span>
                <span className="rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 text-[9px] font-black">
                  100% FREE
                </span>
              </div>

              <ul className="space-y-2.5 text-xs text-white">
                <li className="flex items-center gap-2 font-bold">
                  <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span>6 Movies / Day Free</span>
                </li>
                <li className="flex items-center gap-2 font-bold">
                  <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span>1 TV Series Season / Day</span>
                </li>
                <li className="flex items-center gap-2">
                  <Zap className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span>Priority Ultra-Fast Queue</span>
                </li>
                <li className="flex items-center gap-2">
                  <Coins className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                  <span className="text-amber-400 font-bold">+50 Free Coins Bonus</span>
                </li>
              </ul>
            </div>

            <button
              onClick={handleGoogleLogin}
              className="mt-4 w-full flex items-center justify-center gap-2 rounded-xl bg-white py-2.5 text-xs font-black text-black shadow-lg hover:bg-gray-100 transition-all active:scale-95"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>SIGN IN WITH GOOGLE</span>
            </button>
          </div>
        </div>

        {/* Footer Note */}
        <div className="flex items-center justify-center gap-1.5 text-[10px] text-gray-500 text-center">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          <span>1 Device = 1 Account • Auto WhatsApp mention when downloaded</span>
        </div>
      </div>
    </div>
  );
};
