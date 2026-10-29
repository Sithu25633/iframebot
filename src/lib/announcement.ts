// Shared announcement message for the VIP unlock & share flow.
// The site URL and bot number are injected dynamically so the message
// always points at the current deployment.

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://web-umber-six-e1un7z6257.vercel.app";

export const BOT_PHONE_DISPLAY = "+94 76 037 2547";
export const BOT_PHONE_WA = "94760372547";

export function buildAnnouncementMessage(): string {
  return `Now you can get any of the latest English, Hindi, Tamil, or South Indian movies directly into our WhatsApp Group as a Document! 😍

✅ With Sinhala Subtitles
✅ In 1080p Full HD / 720p / 480p Quality

━━━━━━━━━━━━━━━━━━━━
📌 How to Request a Movie:

1️⃣ Go to our official website 👉 ${SITE_URL}
2️⃣ Search and select your desired Movie 🎬
3️⃣ Choose your preferred Quality (1080p / 720p / 480p) and tap "Open WhatsApp" 📲
4️⃣ Once you send the message to the Bot, the Movie will be uploaded to the group instantly! ⚡

━━━━━━━━━━━━━━━━━━━━
🌐 Website: ${SITE_URL}
🤖 Movie Bot: ${BOT_PHONE_DISPLAY}

100% Free • No App or Registration Required! 🎉`;
}
