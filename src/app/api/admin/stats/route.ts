import { NextResponse } from "next/server";
import { getAdminStats } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const pin = url.searchParams.get("pin");

  // Admin PIN verification
  if (pin !== "76037" && pin !== "admin123") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const stats = await getAdminStats();
  return NextResponse.json({ success: true, stats });
}
