export const VIP_PROMO_TEXT = `දැන් ඔයාලට කැමති ඕනෑම English, Hindi, Tamil, South Indian අලුත්ම චිත්‍රපටයක්:
✅ *සිංහල උපසිරැසි (Sinhala Subtitles)* සමඟින්
✅ *1080p Full HD / 720p / 480p* Quality වලින්
✅ Direct අපේ මේ *WhatsApp Group එකටම Document එකක් ලෙස* ගෙන්නගන්න පුළුවන්! 😍

━━━━━━━━━━━━━━━━━━━━
📌 *Movie එකක් Request කරන්නේ මෙහෙමයි:*

1️⃣ අපේ නිල වෙබ් අඩවියට යන්න 👉 *https://web-umber-six-e1un7z6257.vercel.app*
2️⃣ ඔයාට ඕන Movie එක Search කරලා තෝරන්න 🎬
3️⃣ කැමති Quality එක (1080p / 720p / 480p) තෝරලා *"Open WhatsApp"* ඔබන්න 📲
4️⃣ Bot ට මැසේජ් එක Send කළ සැණින් Movie එක Group එකට Upload වෙනවා! ⚡

━━━━━━━━━━━━━━━━━━━━
🌐 *Website:* https://web-umber-six-e1un7z6257.vercel.app
🤖 *Movie Bot:* +94 76 037 2547

_100% Free • කිසිම App එකක් හෝ Registration එකක් අවශ්‍ය නැත!_ 🎉`;

export const ADMIN_PHONE = "94760372547";

export interface VipData {
  isVip: boolean;
  phone?: string;
  activatedAt?: string;
}

export function getVipStatus(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const data = localStorage.getItem("filmfeed_vip_user");
    if (data) {
      const parsed: VipData = JSON.parse(data);
      return Boolean(parsed.isVip);
    }
  } catch (e) {
    console.error("Error reading VIP status:", e);
  }
  return false;
}

export function setVipActive(phone: string): void {
  if (typeof window === "undefined") return;
  try {
    const vipObj: VipData = {
      isVip: true,
      phone,
      activatedAt: new Date().toISOString(),
    };
    localStorage.setItem("filmfeed_vip_user", JSON.stringify(vipObj));
    // also set cookie for SSR / middleware
    document.cookie = `filmfeed_vip=1; path=/; max-age=${365 * 24 * 60 * 60}`;
  } catch (e) {
    console.error("Error saving VIP status:", e);
  }
}
