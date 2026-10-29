import { NextResponse } from "next/server";
import { updateUserCoins } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, delta, reason } = body;

    if (!userId || typeof delta !== "number") {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
    }

    const result = await updateUserCoins(userId, delta);
    if (!result.success) {
      return NextResponse.json({ error: result.error, newBalance: result.newBalance }, { status: 400 });
    }

    return NextResponse.json({ success: true, newBalance: result.newBalance });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
