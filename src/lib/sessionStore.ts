import fs from "fs";
import path from "path";

export interface StreamSession {
  id: string;
  title: string;
  poster: string;
  backdrop?: string;
  sourceUrl: string;
  streamUrl: string;
  quality: string;
  sizeText?: string;
  createdAt: number;
  expiresAt: number; // 8 hours TTL
  isSeries?: boolean;
  season?: number;
  episode?: number;
  subtitles?: { label: string; src: string; lang: string }[];
}

const EIGHT_HOURS_MS = 8 * 60 * 60 * 1000;

// In-memory cache for ultra-low latency lookups
const sessionCache = new Map<string, StreamSession>();

// File storage path (falls back to /tmp on serverless environments like Vercel)
function getStoragePath(): string {
  const isVercel = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME;
  if (isVercel) {
    return path.join("/tmp", "iframe_sessions.json");
  }
  const dataDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) {
    try {
      fs.mkdirSync(dataDir, { recursive: true });
    } catch (_) {}
  }
  return path.join(dataDir, "sessions.json");
}

function loadSessions(): void {
  try {
    const filePath = getStoragePath();
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
      const now = Date.now();
      for (const [id, session] of Object.entries(data)) {
        const s = session as StreamSession;
        if (s.expiresAt > now) {
          sessionCache.set(id, s);
        }
      }
    }
  } catch (err) {
    console.warn("[SessionStore] Failed to load sessions from disk:", err);
  }
}

function saveSessions(): void {
  try {
    const filePath = getStoragePath();
    const data: Record<string, StreamSession> = {};
    const now = Date.now();
    for (const [id, session] of sessionCache.entries()) {
      if (session.expiresAt > now) {
        data[id] = session;
      }
    }
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
  } catch (err) {
    console.warn("[SessionStore] Failed to save sessions to disk:", err);
  }
}

// Initial load
loadSessions();

export function createSession(params: {
  title: string;
  poster: string;
  backdrop?: string;
  sourceUrl: string;
  streamUrl: string;
  quality?: string;
  sizeText?: string;
  isSeries?: boolean;
  season?: number;
  episode?: number;
  subtitles?: { label: string; src: string; lang: string }[];
}): StreamSession {
  pruneExpiredSessions();

  // Generate unique session id: s_<timestamp>_<random>
  const id = `s_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;
  const now = Date.now();
  const expiresAt = now + EIGHT_HOURS_MS;

  const session: StreamSession = {
    id,
    title: params.title,
    poster: params.poster || "",
    backdrop: params.backdrop || "",
    sourceUrl: params.sourceUrl,
    streamUrl: params.streamUrl,
    quality: params.quality || "720p",
    sizeText: params.sizeText || "",
    createdAt: now,
    expiresAt,
    isSeries: params.isSeries || false,
    season: params.season,
    episode: params.episode,
    subtitles: params.subtitles || [],
  };

  sessionCache.set(id, session);
  saveSessions();

  return session;
}

export function getSession(id: string): StreamSession | null {
  const session = sessionCache.get(id);
  if (!session) {
    loadSessions();
    const diskSession = sessionCache.get(id);
    if (!diskSession) return null;
    if (Date.now() > diskSession.expiresAt) {
      sessionCache.delete(id);
      saveSessions();
      return null;
    }
    return diskSession;
  }

  // Check 8-hour expiry
  if (Date.now() > session.expiresAt) {
    sessionCache.delete(id);
    saveSessions();
    return null; // Expired
  }

  return session;
}

export function pruneExpiredSessions(): void {
  const now = Date.now();
  let changed = false;
  for (const [id, session] of sessionCache.entries()) {
    if (session.expiresAt <= now) {
      sessionCache.delete(id);
      changed = true;
    }
  }
  if (changed) {
    saveSessions();
  }
}

export function getRemainingTime(session: StreamSession): {
  hours: number;
  minutes: number;
  seconds: number;
  formatted: string;
  isExpired: boolean;
} {
  const now = Date.now();
  const diff = session.expiresAt - now;
  if (diff <= 0) {
    return { hours: 0, minutes: 0, seconds: 0, formatted: "Expired", isExpired: true };
  }

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return {
    hours,
    minutes,
    seconds,
    formatted: `${hours}h ${minutes}m ${seconds}s`,
    isExpired: false,
  };
}
