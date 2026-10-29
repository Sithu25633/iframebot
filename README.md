# FilmFeed Iframe Stream Web (Ad-Free Cinema Player) 🍿⚡

A dedicated online video streaming and iframe web service built with Next.js, CineSubz high-speed resolvers, and Cloudflare R2 / S3 direct CDN streaming.

---

## 🚀 Key Highlights & Architectural Features

1. **⚡ Zero Ads & Zero Popups**:
   - Completely stripped of any ad networks, pop-unders, redirect loops, and malicious trackers.
   - 100% clean, dedicated streaming.

2. **⚡ Buffer-Free Ultra High-Speed Playback**:
   - Instead of overloaded third-party aggregators (VidSrc, 2Embed, etc.), streams are resolved directly from CineSubz's high-bandwidth Cloudflare R2 and S3 storage endpoints.
   - Built-in HTTP Range request forwarding (`bytes=start-end`) allows instantaneous seeking forward/backward without waiting for the full video to download.

3. **⏳ 8-Hour Auto-Expiration (TTL)**:
   - When a user clicks **"Request Online Iframe Web"**, a unique private stream session is generated.
   - The stream link and iframe are valid for exactly **8 hours** (`expiresAt = Date.now() + 8 * 3600 * 1000`).
   - After 8 hours, sessions automatically expire (returning `410 Gone`), and any temporary cached files are permanently deleted.

4. **📺 Universal Responsive Iframe Player (`/embed/[sessionId]`)**:
   - Native dark cinema UI with custom seek, volume, speed controls (0.5x - 2x), and fullscreen support.
   - Dynamic real-time expiration ticker (`⏳ Expires in: 7h 55m`).
   - Can be embedded on ANY web page via a single `<iframe>` tag:
     ```html
     <iframe src="https://<your-domain>/embed/<sessionId>" width="100%" height="100%" frameborder="0" allowfullscreen allow="autoplay; fullscreen; encrypted-media; picture-in-picture"></iframe>
     ```

5. **🍿 Cinema Theater Watch Room (`/watch/[sessionId]`)**:
   - Standalone viewing theater with one-click **"Copy Iframe Code"** and **"Share Link"** buttons.

---

## 🛠️ API Endpoints

- `POST /api/stream/resolve`: Resolves a movie / TV series episode into an 8-hour stream session.
- `GET /api/stream/session?id=<sessionId>`: Retrieves stream session metadata and remaining time.
- `GET /api/stream/play/<sessionId>`: High-speed HTTP Range video proxy streaming directly from source storage.
- `GET /api/stream/cleanup`: Automated cron endpoint that purges sessions and files older than 8 hours.

---

## 📦 Deployment

### Deploy to Vercel
```bash
npx vercel --prod
```
The project includes `vercel.json` and full Next.js App Router support.
