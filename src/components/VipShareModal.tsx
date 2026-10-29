"use client";

import React, { useState, useEffect } from "react";
import { VIP_PROMO_TEXT, ADMIN_PHONE, setVipActive } from "@/lib/vip";
import { getCurrentUser } from "@/lib/userState";
import {
  Crown,
  Share2,
  CheckCircle,
  Clock,
  Upload,
  AlertCircle,
  X,
  ShieldCheck,
  Sparkles,
  Image as ImageIcon,
} from "lucide-react";

interface VipShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVipActivated: () => void;
  seriesTitle?: string;
}

export const VipShareModal: React.FC<VipShareModalProps> = ({
  isOpen,
  onClose,
  onVipActivated,
  seriesTitle = "TV Series",
}) => {
  const [hasShared, setHasShared] = useState(false);
  const [timer, setTimer] = useState(10);
  const [timerActive, setTimerActive] = useState(false);
  const [phone, setPhone] = useState("");
  const [screenshotBase64, setScreenshotBase64] = useState<string>("");
  const [screenshotFileName, setScreenshotFileName] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const user = getCurrentUser();
    if (user?.phone) setPhone(user.phone);
  }, [isOpen]);

  useEffect(() => {
    let interval: any = null;
    if (timerActive && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [timerActive, timer]);

  if (!isOpen) return null;

  const handleShareClick = () => {
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(VIP_PROMO_TEXT)}`;
    window.open(waUrl, "_blank");
    setHasShared(true);
    setTimerActive(true);
    setTimer(10);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setScreenshotFileName(file.name);
      setError(null);

      // Convert image to Base64 with canvas resizing if needed
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 900;
          const MAX_HEIGHT = 1200;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL("image/jpeg", 0.75);
          setScreenshotBase64(dataUrl);
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 9) {
      setError("කරුණාකර ඔබගේ නිවැරදි WhatsApp අංකය ඇතුළත් කරන්න.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const user = getCurrentUser();

      // 1. Send Screenshot and Details to Cloud Database API
      const res = await fetch("/api/vip/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id,
          userName: user?.name || "Member",
          phone: phone.trim(),
          seriesTitle,
          screenshotBase64,
        }),
      });

      if (!res.ok) {
        throw new Error("Screenshot upload failed. Please try again.");
      }

      // 2. Activate VIP status locally
      setVipActive(phone);
      if (user) {
        user.isVip = true;
        user.phone = phone.trim();
        localStorage.setItem("filmfeed_current_user", JSON.stringify(user));
      }

      // 3. Open WhatsApp to Notify Admin with Professional Format
      const adminMsg = `⭐ *[FILMFEED VIP ACCESS SUBMISSION]*\n\n👤 *User:* ${user?.name || "VIP Member"}\n📱 *WhatsApp Number:* ${phone}\n📺 *Requested Content:* ${seriesTitle}\n📸 *Verification Status:* 2 Group Share Completed & Screenshot Uploaded to Cloud Server.\n\n_System Admin, please verify VIP credentials in FilmFeed Control Panel._\n👉 https://web-umber-six-e1un7z6257.vercel.app/admin`;
      const adminWaUrl = `https://api.whatsapp.com/send?phone=${ADMIN_PHONE}&text=${encodeURIComponent(adminMsg)}`;
      window.open(adminWaUrl, "_blank");

      // 4. Callback and Close
      onVipActivated();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to submit VIP verification.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn text-white">
      <div className="relative w-full max-w-lg rounded-3xl border border-white/20 bg-surface p-6 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-full bg-white/10 p-2 text-gray-400 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header Badge */}
        <div className="flex items-center gap-2.5 mb-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-black font-black shrink-0">
            <Crown className="h-6 w-6" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/5 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-gray-300">
              <Sparkles className="h-3 w-3" />
              <span>VIP Pass Verification</span>
            </div>
            <h2 className="text-lg font-black text-white">Unlock TV Series (Full Season Pack)</h2>
          </div>
        </div>

        <p className="text-xs text-gray-300 leading-relaxed mb-4">
          ටීවී සීරීස් (Episode 1 සිට අවසානය දක්වා) Request කිරීමට පහත පියවර 2 සම්පූර්ණ කර <b className="text-white">VIP Pass එක නොමිලේම සක්‍රිය</b> කරගන්න!
        </p>

        {/* Step 1: Share on WhatsApp */}
        <div className="mb-4 rounded-2xl border border-white/10 bg-black/60 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-black text-[11px] font-black">1</span>
              <span>WhatsApp Group 2 කට හෝ යහළුවන්ට Share කරන්න</span>
            </span>
            {hasShared && !timerActive && (
              <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-bold">
                <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                <span>Shared</span>
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleShareClick}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-white py-3 px-4 text-xs font-black text-black hover:bg-gray-200 transition-all active:scale-98"
          >
            <Share2 className="h-4 w-4" />
            <span>SHARE TO WHATSAPP GROUPS</span>
          </button>

          {timerActive && (
            <div className="mt-3 flex items-center justify-center gap-2 text-xs text-gray-400">
              <Clock className="h-4 w-4 animate-spin text-white" />
              <span>Checking verification in: <b className="text-white">{timer}s</b>...</span>
            </div>
          )}
        </div>

        {/* Step 2: Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="rounded-2xl border border-white/10 bg-black/60 p-4 space-y-3">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-black text-[11px] font-black">2</span>
              <span>WhatsApp අංකය සහ Share Screenshot එක Upload කරන්න</span>
            </span>

            {/* Phone */}
            <div>
              <label className="block text-[11px] font-bold text-gray-300 mb-1">ඔබගේ WhatsApp දුරකථන අංකය:</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0771234567 හෝ 94771234567"
                className="w-full rounded-xl border border-white/15 bg-surface px-3 py-2 text-xs text-white placeholder-gray-500 focus:border-white focus:outline-none"
                required
              />
            </div>

            {/* Screenshot Upload with preview */}
            <div>
              <label className="block text-[11px] font-bold text-gray-300 mb-1">Share කළ බව පෙන්වන Screenshot එක:</label>
              <label className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-white/20 bg-surface/50 p-4 text-xs text-gray-400 cursor-pointer hover:border-white hover:text-white transition-all">
                {screenshotBase64 ? (
                  <div className="flex flex-col items-center gap-2">
                    <img
                      src={screenshotBase64}
                      alt="Preview"
                      className="max-h-32 rounded-lg border border-white/20 object-contain shadow-md"
                    />
                    <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      <span>{screenshotFileName || "Screenshot Selected"} (Ready to upload)</span>
                    </span>
                  </div>
                ) : (
                  <>
                    <Upload className="h-6 w-6 text-gray-400" />
                    <span className="font-bold">Screenshot එක මෙතැනින් තෝරන්න (Tap to Upload)</span>
                    <span className="text-[10px] text-gray-500">JPG, PNG supported</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-white py-3.5 px-6 text-sm font-black text-black shadow-glow-white hover:bg-gray-100 disabled:opacity-50 transition-all active:scale-95"
          >
            <ShieldCheck className="h-5 w-5" />
            <span>{isSubmitting ? "UPLOADING SCREENSHOT TO SERVER..." : "SUBMIT SCREENSHOT & ACTIVATE VIP"}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
