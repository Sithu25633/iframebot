import { NextResponse } from "next/server";
import { getUserByDeviceId, getUserById, getUserByEmail } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  const deviceId = searchParams.get("deviceId");
  const email = searchParams.get("email");

  let user = null;
  if (userId) user = await getUserById(userId);
  if (!user && deviceId) user = await getUserByDeviceId(deviceId);
  if (!user && email) user = await getUserByEmail(email);

  if (!user) {
    return NextResponse.json({ user: null, authenticated: false });
  }

  return NextResponse.json({
    user,
    authenticated: true,
  });
}
