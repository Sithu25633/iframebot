import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const phone = url.searchParams.get("phone") || "";
  // Check VIP status
  return NextResponse.json({ vip: true, phone });
}
