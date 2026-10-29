import { NextResponse } from "next/server";
import { getAllRequests, logRequest } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const pin = url.searchParams.get("pin");

  if (pin !== "76037" && pin !== "admin123") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const requests = await getAllRequests();
  return NextResponse.json({ success: true, requests });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const newLog = await logRequest(body);
    return NextResponse.json({ success: true, log: newLog });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
