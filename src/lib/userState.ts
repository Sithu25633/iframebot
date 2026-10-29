export interface UserProfile {
  id: string;
  name: string;
  email: string;
  image?: string;
  phone?: string;
  deviceId: string;
  coins: number;
  isVip: boolean;
  isBanned?: boolean;
  createdAt: string;
  lastLoginAt: string;
}

export interface UserDailyUsage {
  date: string; // YYYY-MM-DD
  moviesRequested: number;
  seriesRequested: number;
  guestMovieCount: number;
}

const USER_STORAGE_KEY = "filmfeed_current_user";
const USAGE_STORAGE_KEY = "filmfeed_daily_usage";
const DEVICE_ID_KEY = "filmfeed_device_id";

// Get or generate persistent unique device ID
export function getDeviceId(): string {
  if (typeof window === "undefined") return "server-device";
  let devId = localStorage.getItem(DEVICE_ID_KEY);
  if (!devId) {
    devId = "dev_" + Math.random().toString(36).substring(2, 12) + "_" + Date.now().toString(36);
    localStorage.setItem(DEVICE_ID_KEY, devId);
    document.cookie = `filmfeed_device_id=${devId}; path=/; max-age=31536000; SameSite=Lax`;
  }
  return devId;
}

export function getCurrentDateStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function getDailyUsage(): UserDailyUsage {
  if (typeof window === "undefined") {
    return { date: getCurrentDateStr(), moviesRequested: 0, seriesRequested: 0, guestMovieCount: 0 };
  }
  try {
    const raw = localStorage.getItem(USAGE_STORAGE_KEY);
    const today = getCurrentDateStr();
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.date === today) {
        return parsed;
      }
    }
    // New day reset
    const fresh: UserDailyUsage = {
      date: today,
      moviesRequested: 0,
      seriesRequested: 0,
      guestMovieCount: 0,
    };
    localStorage.setItem(USAGE_STORAGE_KEY, JSON.stringify(fresh));
    return fresh;
  } catch (e) {
    return { date: getCurrentDateStr(), moviesRequested: 0, seriesRequested: 0, guestMovieCount: 0 };
  }
}

export function incrementUsage(type: "movie" | "series", isGuest: boolean): UserDailyUsage {
  const usage = getDailyUsage();
  if (isGuest) {
    usage.guestMovieCount = (usage.guestMovieCount || 0) + 1;
  } else {
    if (type === "series") {
      usage.seriesRequested = (usage.seriesRequested || 0) + 1;
    } else {
      usage.moviesRequested = (usage.moviesRequested || 0) + 1;
    }
  }
  try {
    localStorage.setItem(USAGE_STORAGE_KEY, JSON.stringify(usage));
  } catch (e) {}
  return usage;
}

export function getCurrentUser(): UserProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return null;
}

export function setCurrentUser(user: UserProfile | null): void {
  if (typeof window === "undefined") return;
  try {
    if (user) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
      document.cookie = `filmfeed_user_id=${user.id}; path=/; max-age=31536000; SameSite=Lax`;
    } else {
      localStorage.removeItem(USER_STORAGE_KEY);
      document.cookie = "filmfeed_user_id=; path=/; max-age=0";
    }
  } catch (e) {}
}

export function updateLocalUserCoins(newBalance: number): void {
  const user = getCurrentUser();
  if (user) {
    user.coins = newBalance;
    setCurrentUser(user);
  }
}

// Sync latest VIP / coins state with server database on load
export async function syncUserWithServer(): Promise<UserProfile | null> {
  if (typeof window === "undefined") return null;
  const current = getCurrentUser();
  const deviceId = getDeviceId();

  try {
    let url = `/api/user/me?deviceId=${encodeURIComponent(deviceId)}`;
    if (current?.id) {
      url += `&userId=${encodeURIComponent(current.id)}`;
    } else if (current?.email) {
      url += `&email=${encodeURIComponent(current.email)}`;
    }

    const res = await fetch(url);
    if (!res.ok) return current;
    const data = await res.json();
    if (data.user) {
      setCurrentUser(data.user);
      return data.user;
    }
  } catch (e) {}
  return current;
}
