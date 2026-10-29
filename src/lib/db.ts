import { UserProfile } from "./userState";
import {
  getFirestoreUser,
  getFirestoreUserByEmail,
  getFirestoreUserByDeviceId,
  listFirestoreUsers,
  saveFirestoreUser,
  updateFirestoreUserCoins,
  setFirestoreUserVip,
  setFirestoreUserBan,
  logFirestoreRequest,
  listFirestoreRequests,
  getFirestoreStats,
  FirestoreUser,
  FirestoreRequest,
} from "./firestore";

export type RequestLog = FirestoreRequest;

// ----------------------------------------------------------------------------
// Users Operations (Backed by Cloud Firestore)
// ----------------------------------------------------------------------------
export async function getAllUsers(): Promise<UserProfile[]> {
  const users = await listFirestoreUsers();
  return users.sort(
    (a, b) => new Date(b.lastLoginAt || 0).getTime() - new Date(a.lastLoginAt || 0).getTime()
  );
}

export async function getUserById(id: string): Promise<UserProfile | null> {
  return await getFirestoreUser(id);
}

export async function getUserByEmail(email: string): Promise<UserProfile | null> {
  return await getFirestoreUserByEmail(email);
}

export async function getUserByDeviceId(deviceId: string): Promise<UserProfile | null> {
  return await getFirestoreUserByDeviceId(deviceId);
}

export async function upsertUser(data: Partial<UserProfile> & { email: string; deviceId: string; name: string }): Promise<{
  user: UserProfile;
  error?: string;
}> {
  let existingUser = await getFirestoreUserByEmail(data.email);

  // 1 Device = 1 Account Strict Binding
  const existingDeviceUser = await getFirestoreUserByDeviceId(data.deviceId);
  if (existingDeviceUser && existingDeviceUser.email.toLowerCase() !== data.email.toLowerCase()) {
    return {
      user: existingDeviceUser,
      error: `මෙම Device එකේ දැනටමත් (${existingDeviceUser.email}) එකවුන්ට් එක ලියාපදිංචි වී ඇත. එක් Device එකකින් භාවිතා කළ හැක්කේ එක් Account එකක් පමණි!`,
    };
  }

  if (existingUser) {
    // Update existing user
    existingUser.name = data.name || existingUser.name;
    existingUser.image = data.image || existingUser.image;
    existingUser.phone = data.phone || existingUser.phone;
    existingUser.deviceId = data.deviceId || existingUser.deviceId;
    existingUser.lastLoginAt = new Date().toISOString();
    await saveFirestoreUser(existingUser);
    return { user: existingUser };
  } else {
    // Create new user with 50 Welcome Coins
    const newUser: UserProfile = {
      id: "usr_" + Math.random().toString(36).substring(2, 10),
      name: data.name,
      email: data.email,
      image: data.image,
      phone: data.phone || "",
      deviceId: data.deviceId,
      coins: 50, // 50 Welcome Coins
      isVip: false,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };
    await saveFirestoreUser(newUser);
    return { user: newUser };
  }
}

export async function updateUserCoins(userId: string, delta: number): Promise<{ success: boolean; newBalance: number; error?: string }> {
  const result = await updateFirestoreUserCoins(userId, delta);
  if (!result.success) return { success: false, newBalance: 0, error: "User not found" };
  return { success: true, newBalance: result.newBalance };
}

export async function setUserVip(userId: string, isVip: boolean): Promise<boolean> {
  return await setFirestoreUserVip(userId, isVip);
}

export async function setUserBan(userId: string, isBanned: boolean): Promise<boolean> {
  return await setFirestoreUserBan(userId, isBanned);
}

// ----------------------------------------------------------------------------
// Requests Stream Operations
// ----------------------------------------------------------------------------
export async function logRequest(req: Omit<RequestLog, "id" | "timestamp">): Promise<RequestLog> {
  return await logFirestoreRequest(req);
}

export async function getAllRequests(): Promise<RequestLog[]> {
  return await listFirestoreRequests();
}

export async function getAdminStats() {
  return await getFirestoreStats();
}
