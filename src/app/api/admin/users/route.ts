import { NextResponse } from "next/server";
import { getAllUsers, updateUserCoins, setUserVip, setUserBan } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const pin = url.searchParams.get("pin");

  if (pin !== "76037" && pin !== "admin123") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const users = await getAllUsers();
  return NextResponse.json({ success: true, users });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { pin, action, userId, amount, isVip, isBanned } = body;

    if (pin !== "76037" && pin !== "admin123") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (action === "update_coins") {
      const res = await updateUserCoins(userId, amount);
      return NextResponse.json(res);
    }

    if (action === "toggle_vip") {
      const ok = await setUserVip(userId, isVip);
      return NextResponse.json({ success: ok });
    }

    if (action === "toggle_ban") {
      const ok = await setUserBan(userId, isBanned);
      return NextResponse.json({ success: ok });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
