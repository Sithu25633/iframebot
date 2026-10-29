"use client";

import React, { useState } from "react";
import { getDeviceId, setCurrentUser, UserProfile } from "@/lib/userState";
import { Lock, LogIn, AlertCircle, X, ShieldCheck, Sparkles, Smartphone } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserProfile) => void;
  reason?: string;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  reason = "දිගටම Movies & TV Series Request කිරීමට Google Sign In වන්න.",
}) => {
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleAuthRedirect = () => {
    setIsLoading(true);
    setError(null);
    const deviceId = getDeviceId();
    const currentPath = window.location.pathname + window.location.search;

    const authUrl = `/api/auth/google?deviceId=${encodeURIComponent(
      deviceId
    )}&phone=${encodeURIComponent(phone.trim())}&returnTo=${encodeURIComponent(
      currentPath
    )}`;

    window.location.href = authUrl;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn text-white">
      <div className="relative w-full max-w-md rounded-3xl border border-white/20 bg-surface p-7 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-full bg-white/10 p-2 text-gray-400 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-white text-black font-black shadow-lg mb-3">
            <svg className="h-8 w-8" viewBox="0 0 24 24">
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
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/5 px-3 py-0.5 text-xs font-black uppercase tracking-wider text-gray-300 mb-1">
            <Sparkles className="h-3 w-3" />
            <span>Official Google OAuth</span>
          </div>
          <h2 className="text-xl font-black text-white">Sign In With Google</h2>
          <p className="text-xs text-gray-400 mt-1">{reason}</p>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-2xl border border-red-500/30 bg-red-500/10 p-3.5 text-xs text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-gray-300 mb-1.5 flex items-center gap-1.5">
              <Smartphone className="h-3.5 w-3.5 text-emerald-400" />
              <span>WhatsApp Number (Optional for Auto-Tag):</span>
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0760372547"
              className="w-full rounded-2xl border border-white/15 bg-black/60 px-4 py-3 text-xs text-white placeholder-gray-500 focus:border-white focus:outline-none"
            />
            <p className="text-[10px] text-gray-500 mt-1">
              Used to tag your name in WhatsApp Groups when your movie finishes downloading.
            </p>
          </div>

          {/* Official Google Sign In Button */}
          <button
            type="button"
            onClick={handleGoogleAuthRedirect}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 rounded-2xl bg-white py-4 px-6 text-sm font-black text-black shadow-glow-white hover:bg-gray-100 disabled:opacity-50 transition-all active:scale-98"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
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
            <span>{isLoading ? "CONNECTING TO GOOGLE..." : "CONTINUE WITH GOOGLE"}</span>
          </button>

          {/* Device Lock Info */}
          <div className="rounded-2xl border border-white/10 bg-black/60 p-3 flex items-center gap-2.5 text-[11px] text-gray-400">
            <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>1 Device = 1 Account Lock (Daily free limits apply automatically).</span>
          </div>
        </div>
      </div>
    </div>
  );
};
