/**
 * FilmFeed Cloud Firestore Client (REST Engine)
 * Project: mfeed-d6ad6
 * High-speed, zero-dependency, works universally on Vercel Serverless and Edge.
 */

const PROJECT_ID = "mfeed-d6ad6";
const API_KEY = "AIzaSyC__eUOVvcSFNzXX7ppABhlpeur-5daF-g";
const BASE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

// Convert standard JavaScript object to Firestore REST format
function toFirestoreFields(obj: any): any {
  const fields: any = {};
  for (const key of Object.keys(obj)) {
    const val = obj[key];
    if (val === undefined || val === null) {
      fields[key] = { nullValue: null };
    } else if (typeof val === "boolean") {
      fields[key] = { booleanValue: val };
    } else if (typeof val === "number") {
      if (Number.isInteger(val)) {
        fields[key] = { integerValue: String(val) };
      } else {
        fields[key] = { doubleValue: val };
      }
    } else if (typeof val === "string") {
      fields[key] = { stringValue: val };
    } else if (Array.isArray(val)) {
      fields[key] = {
        arrayValue: {
          values: val.map((item) => {
            if (typeof item === "string") return { stringValue: item };
            if (typeof item === "number") return { integerValue: String(item) };
            if (typeof item === "boolean") return { booleanValue: item };
            return { stringValue: String(item) };
          }),
        },
      };
    } else if (typeof val === "object") {
      fields[key] = { mapValue: { fields: toFirestoreFields(val) } };
    }
  }
  return fields;
}

// Convert Firestore REST format back to plain JavaScript object
function fromFirestoreDocument(doc: any): any {
  if (!doc || !doc.fields) return null;
  const obj: any = {};
  const fields = doc.fields;
  for (const key of Object.keys(fields)) {
    const f = fields[key];
    if (f.stringValue !== undefined) obj[key] = f.stringValue;
    else if (f.integerValue !== undefined) obj[key] = parseInt(f.integerValue, 10);
    else if (f.doubleValue !== undefined) obj[key] = parseFloat(f.doubleValue);
    else if (f.booleanValue !== undefined) obj[key] = f.booleanValue;
    else if (f.nullValue !== undefined) obj[key] = null;
    else if (f.arrayValue !== undefined) {
      obj[key] = (f.arrayValue.values || []).map((v: any) =>
        v.stringValue !== undefined
          ? v.stringValue
          : v.integerValue !== undefined
          ? parseInt(v.integerValue, 10)
          : v.booleanValue !== undefined
          ? v.booleanValue
          : v
      );
    } else if (f.mapValue !== undefined) {
      obj[key] = fromFirestoreDocument(f.mapValue);
    }
  }
  return obj;
}

export interface FirestoreUser {
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

export interface FirestoreRequest {
  id: string;
  userId?: string;
  userName: string;
  userPhone?: string;
  title: string;
  type: "movie" | "series";
  season?: number;
  quality: string;
  token: string;
  status: "completed" | "queued" | "failed";
  timestamp: string;
}

export interface VipSubmission {
  id: string;
  userId?: string;
  userName?: string;
  phone: string;
  seriesTitle: string;
  screenshotUrl?: string; // Base64 or hosted image url
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

// ----------------------------------------------------------------------------
// Users Operations
// ----------------------------------------------------------------------------
export async function getFirestoreUser(id: string): Promise<FirestoreUser | null> {
  try {
    const res = await fetch(`${BASE_URL}/users/${encodeURIComponent(id)}?key=${API_KEY}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = await res.json();
    return fromFirestoreDocument(data);
  } catch (e) {
    return null;
  }
}

export async function getFirestoreUserByEmail(email: string): Promise<FirestoreUser | null> {
  const users = await listFirestoreUsers();
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
}

export async function getFirestoreUserByDeviceId(deviceId: string): Promise<FirestoreUser | null> {
  const users = await listFirestoreUsers();
  return users.find((u) => u.deviceId === deviceId) || null;
}

export async function listFirestoreUsers(): Promise<FirestoreUser[]> {
  try {
    const res = await fetch(`${BASE_URL}/users?pageSize=100&key=${API_KEY}`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    const data = await res.json();
    if (!data.documents) return [];
    return data.documents.map(fromFirestoreDocument).filter(Boolean);
  } catch (e) {
    return [];
  }
}

export async function saveFirestoreUser(user: FirestoreUser): Promise<boolean> {
  try {
    const body = JSON.stringify({ fields: toFirestoreFields(user) });
    const res = await fetch(`${BASE_URL}/users/${encodeURIComponent(user.id)}?key=${API_KEY}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body,
      cache: "no-store",
    });
    return res.ok;
  } catch (e) {
    return false;
  }
}

export async function updateFirestoreUserCoins(userId: string, delta: number): Promise<{ success: boolean; newBalance: number }> {
  const user = await getFirestoreUser(userId);
  if (!user) return { success: false, newBalance: 0 };
  const updated = Math.max(0, (user.coins || 0) + delta);
  user.coins = updated;
  await saveFirestoreUser(user);
  return { success: true, newBalance: updated };
}

export async function setFirestoreUserVip(userId: string, isVip: boolean): Promise<boolean> {
  const user = await getFirestoreUser(userId);
  if (!user) return false;
  user.isVip = isVip;
  return await saveFirestoreUser(user);
}

export async function setFirestoreUserBan(userId: string, isBanned: boolean): Promise<boolean> {
  const user = await getFirestoreUser(userId);
  if (!user) return false;
  user.isBanned = isBanned;
  return await saveFirestoreUser(user);
}

// ----------------------------------------------------------------------------
// Requests Stream Operations
// ----------------------------------------------------------------------------
export async function logFirestoreRequest(req: Omit<FirestoreRequest, "id" | "timestamp">): Promise<FirestoreRequest> {
  const id = "req_" + Date.now().toString(36) + "_" + Math.random().toString(36).substring(2, 6);
  const fullReq: FirestoreRequest = {
    ...req,
    id,
    timestamp: new Date().toISOString(),
  };

  try {
    const body = JSON.stringify({ fields: toFirestoreFields(fullReq) });
    await fetch(`${BASE_URL}/requests/${encodeURIComponent(id)}?key=${API_KEY}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body,
      cache: "no-store",
    });
  } catch (e) {}

  return fullReq;
}

export async function listFirestoreRequests(): Promise<FirestoreRequest[]> {
  try {
    const res = await fetch(`${BASE_URL}/requests?pageSize=100&key=${API_KEY}`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    const data = await res.json();
    if (!data.documents) return [];
    const list: FirestoreRequest[] = data.documents.map(fromFirestoreDocument).filter(Boolean);
    return list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  } catch (e) {
    return [];
  }
}

// ----------------------------------------------------------------------------
// VIP Screenshot Submissions
// ----------------------------------------------------------------------------
export async function saveVipSubmission(sub: Omit<VipSubmission, "id" | "createdAt" | "status">): Promise<VipSubmission> {
  const id = "vip_" + Date.now().toString(36) + "_" + Math.random().toString(36).substring(2, 6);
  const fullSub: VipSubmission = {
    ...sub,
    id,
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  try {
    const body = JSON.stringify({ fields: toFirestoreFields(fullSub) });
    await fetch(`${BASE_URL}/vip_submissions/${encodeURIComponent(id)}?key=${API_KEY}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body,
      cache: "no-store",
    });
  } catch (e) {}

  return fullSub;
}

export async function listVipSubmissions(): Promise<VipSubmission[]> {
  try {
    const res = await fetch(`${BASE_URL}/vip_submissions?pageSize=50&key=${API_KEY}`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    const data = await res.json();
    if (!data.documents) return [];
    const list: VipSubmission[] = data.documents.map(fromFirestoreDocument).filter(Boolean);
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (e) {
    return [];
  }
}

export async function updateVipSubmissionStatus(id: string, status: "approved" | "rejected"): Promise<boolean> {
  try {
    const res = await fetch(`${BASE_URL}/vip_submissions/${encodeURIComponent(id)}?key=${API_KEY}`, {
      cache: "no-store",
    });
    if (!res.ok) return false;
    const data = await res.json();
    const sub = fromFirestoreDocument(data);
    if (!sub) return false;

    sub.status = status;
    const body = JSON.stringify({ fields: toFirestoreFields(sub) });
    const updateRes = await fetch(`${BASE_URL}/vip_submissions/${encodeURIComponent(id)}?key=${API_KEY}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body,
      cache: "no-store",
    });

    if (updateRes.ok && status === "approved" && sub.userId) {
      await setFirestoreUserVip(sub.userId, true);
    }
    return updateRes.ok;
  } catch (e) {
    return false;
  }
}

// ----------------------------------------------------------------------------
// Admin Overview Metrics
// ----------------------------------------------------------------------------
export async function getFirestoreStats() {
  const [users, requests, vipSubs] = await Promise.all([
    listFirestoreUsers(),
    listFirestoreRequests(),
    listVipSubmissions(),
  ]);

  const totalUsers = users.length;
  const totalCoins = users.reduce((acc, u) => acc + (u.coins || 0), 0);
  const totalVips = users.filter((u) => u.isVip).length;
  const totalRequests = requests.length;
  const movieRequests = requests.filter((r) => r.type === "movie").length;
  const seriesRequests = requests.filter((r) => r.type === "series").length;
  const pendingVipCount = vipSubs.filter((s) => s.status === "pending").length;

  return {
    totalUsers,
    totalCoins,
    totalVips,
    totalRequests,
    movieRequests,
    seriesRequests,
    pendingVipCount,
    recentRequests: requests.slice(0, 15),
  };
}
