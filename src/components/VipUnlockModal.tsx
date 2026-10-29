"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Share2,
  CheckCircle2,
  UploadCloud,
  Loader2,
  Lock,
  Users,
  Timer,
  PartyPopper,
  ShieldCheck,
} from "lucide-react";
import { buildAnnouncementMessage, BOT_PHONE_WA } from "@/lib/announcement";

interface VipUnlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Called once the bot confirms VIP activation for this phone number */
  onVipActivated?: (phone: string) => void;
}

type Step = "share" | "verify" | "submitting" | "done";

const SHARE_WAIT_SECONDS = 60;

export const VipUnlockModal: React.FC<VipUnlockModalProps> = ({
  isOpen,
  onClose,
  onVipActivated,
}) => {
  const [step, setStep] = useState<Step>("share");
  const [phone, setPhone] = useState("");
  const [countdown, setCountdown] = useState(SHARE_WAIT_SECONDS);
  const [proof, setProof] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Countdown timer while the user shares the announcement
  useEffect(() => {
    if (step !== "verify" || countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [step, countdown]);

  if (!isOpen) return null;

  const normalizePhone = (v: string) => {
    let d = v.replace(/\D/g, "");
    if (d.startsWith("00")) d = d.slice(2);
    if (d.startsWith("0")) d = "94" + d.slice(1);
    if (d.length === 9 && d.startsWith("7")) d = "94" + d;
    return d;
  };

  const phoneValid = normalizePhone(phone).length >= 11;

  const handleShare = () => {
    if (!phoneValid) {
      setError("කරුණාකර ඔබගේ WhatsApp අංකය නිවැරදිව ඇතුළත් කරන්න (07XXXXXXXX)");
      return;
    }
    setError(null);
    const msg = encodeURIComponent(buildAnnouncementMessage());
    window.open(`https://wa.me/?text=${msg}`, "_blank");
    setStep("verify");
    setCountdown(SHARE_WAIT_SECONDS);
  };

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Screenshot image එකක් පමණක් upload කරන්න.");
      return;
    }
    setError(null);
    const reader = new FileReader();
    reader.onload = () => setProof(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!proof) {
      setError("Screenshot proof එක upload කරන්න.");
      return;
    }
    setStep("submitting");
    setError(null);
    try {
      const res = await fetch("/api/vip/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone,
          name: null,
          proof,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Submission failed");
      }
      setStep("done");
      const norm = normalizePhone(phone);
      try {
        localStorage.setItem("ff_vip_phone", norm);
      } catch {}
      onVipActivated?.(norm);
    } catch (e: any) {
      setError(`Submission අසාර්ථකයි: ${e.message}. නැවත උත්සාහ කරන්න.`);
      setStep("verify");
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-lg rounded-3xl border border-amber-500/30 bg-surface-card p-6 shadow-2xl max-h-[92vh] overflow-y-auto">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-full p-2 text-gray-400 hover:bg-white/10 hover:text-white"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Lock className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">
              TV Series — VIP Unlock
            </h2>
            <p className="text-xs text-gray-400">
              100% Free • Share &amp; Verify • Lifetime VIP
            </p>
          </div>
        </div>

        {/* STEP: SHARE */}
        {step === "share" && (
          <div className="mt-5 space-y-4">
            <div className="rounded-2xl bg-surface/80 p-4 border border-white/5 text-sm text-gray-300">
              TV Series / Seasons ඉල්ලීමේ VIP Members ට පමණයි. VIP වීමට:
              <ol className="mt-3 space-y-1.5 text-xs text-gray-400 list-decimal list-inside">
                <li>
                  අපගේ Announcement එක WhatsApp හරහා <b className="text-white">Group 2කට</b> හෝ{" "}
                  <b className="text-white">Friends 5 දෙනෙකුට</b> Share කරන්න
                </li>
                <li>Share කළ ඉන්න Screenshot එකක් ගන්න 📸</li>
                <li>පහතින් Upload කර Submit කරන්න</li>
                <li>ක්ෂණිකව VIP Active — ජීවිත කාලයටම! 🎉</li>
              </ol>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Your WhatsApp Number *
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="07XXXXXXXX"
                className="mt-2 w-full rounded-xl border border-white/10 bg-surface/80 px-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-amber-500"
              />
              <p className="mt-1 text-[11px] text-gray-500">
                VIP ඔබගේ මෙම අංකයටම සම්බන්ධ වේ.
              </p>
            </div>

            {error && (
              <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                {error}
              </p>
            )}

            <button
              onClick={handleShare}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 py-3.5 text-sm font-black text-black transition-all hover:opacity-95 active:scale-95"
            >
              <Share2 className="h-5 w-5" />
              <span>Share Announcement on WhatsApp</span>
            </button>
          </div>
        )}

        {/* STEP: VERIFY (timer + screenshot upload) */}
        {step === "verify" && (
          <div className="mt-5 space-y-4">
            {/* Timer */}
            <div className="rounded-2xl border border-teal-500/20 bg-teal-500/5 p-4 text-center">
              <div className="flex items-center justify-center gap-2 text-teal-400 text-xs font-semibold uppercase tracking-wider">
                <Timer className="h-4 w-4" />
                <span>Sharing in progress</span>
              </div>
              <p className="mt-2 text-3xl font-black text-white tabular-nums">
                {String(Math.floor(countdown / 60)).padStart(2, "0")}:
                {String(countdown % 60).padStart(2, "0")}
              </p>
              <p className="mt-2 flex items-center justify-center gap-1.5 text-xs text-gray-400">
                <Users className="h-3.5 w-3.5" />
                <span>
                  Message එක <b className="text-white">Group 2කට</b> හෝ{" "}
                  <b className="text-white">Friends 5 දෙනෙකුට</b> Share කරන්න
                </span>
              </p>
              {countdown > 0 && (
                <p className="mt-1 text-[11px] text-gray-500">
                  තවම Share නොකළාද?{" "}
                  <button
                    onClick={handleShare}
                    className="underline text-teal-400 hover:text-teal-300"
                  >
                    WhatsApp නැවත විවෘත කරන්න
                  </button>
                </p>
              )}
            </div>

            {/* Screenshot upload */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`cursor-pointer rounded-2xl border-2 border-dashed p-6 text-center transition-colors ${
                proof
                  ? "border-emerald-500/50 bg-emerald-500/5"
                  : "border-white/15 bg-surface/50 hover:border-amber-500/50"
              }`}
            >
              {proof ? (
                <div className="space-y-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={proof}
                    alt="Proof screenshot"
                    className="mx-auto max-h-48 rounded-xl border border-white/10"
                  />
                  <p className="flex items-center justify-center gap-1.5 text-xs font-semibold text-emerald-400">
                    <CheckCircle2 className="h-4 w-4" /> Screenshot ready —
                    click to replace
                  </p>
                </div>
              ) : (
                <div className="space-y-2 text-gray-400">
                  <UploadCloud className="mx-auto h-10 w-10" />
                  <p className="text-sm font-semibold text-white">
                    Share කළ Screenshot එක Upload කරන්න
                  </p>
                  <p className="text-[11px]">PNG / JPG (WhatsApp share proof)</p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFile(e.target.files?.[0])}
              />
            </div>

            {error && (
              <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                {error}
              </p>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setStep("share")}
                className="rounded-2xl border border-white/10 px-4 py-3 text-xs font-bold text-gray-300 hover:bg-white/5"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={!proof || countdown > 0}
                className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 py-3.5 text-sm font-black text-black transition-all hover:opacity-95 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ShieldCheck className="h-5 w-5" />
                <span>
                  {countdown > 0
                    ? `Submit (${countdown}s)...`
                    : "Submit & Activate VIP"}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* STEP: SUBMITTING */}
        {step === "submitting" && (
          <div className="mt-8 flex flex-col items-center gap-4 py-6 text-center">
            <Loader2 className="h-12 w-12 animate-spin text-amber-400" />
            <p className="text-sm font-semibold text-white">
              Verification එක Bot වෙත යවමින්...
            </p>
            <p className="text-xs text-gray-400">
              Screenshot එක සහ ඔබගේ අංකය Owner වෙත යවනු ලැබේ
            </p>
          </div>
        )}

        {/* STEP: DONE */}
        {step === "done" && (
          <div className="mt-6 flex flex-col items-center gap-4 py-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 border border-emerald-500/40">
              <PartyPopper className="h-8 w-8 text-emerald-400" />
            </div>
            <h3 className="text-xl font-black text-white">
              VIP Activated! 🎉
            </h3>
            <p className="text-sm text-gray-300 max-w-sm">
              ඔබට දැන් TV Series / Seasons ඕනෑම එකක් Request කළ හැක. මෙම VIP
              තත්ත්වය <b className="text-emerald-400">ස්ථිර</b> වන අතර නැවත කිසිදා
              Share කිරීම් අවශ්‍ය නොවේ.
            </p>
            <button
              onClick={onClose}
              className="rounded-2xl bg-emerald-500 px-8 py-3 text-sm font-black text-black hover:opacity-95 active:scale-95 transition-all"
            >
              🎬 TV Series Request කරන්න
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
