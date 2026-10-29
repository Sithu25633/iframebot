import { NextResponse } from "next/server";
import { listVipSubmissions, updateVipSubmissionStatus } from "@/lib/firestore";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const pin = url.searchParams.get("pin");

  if (pin !== "76037" && pin !== "admin123") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const submissions = await listVipSubmissions();
  return NextResponse.json({ success: true, submissions });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { pin, submissionId, status } = body;

    if (pin !== "76037" && pin !== "admin123") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!submissionId || (status !== "approved" && status !== "rejected")) {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
    }

    const ok = await updateVipSubmissionStatus(submissionId, status);
    return NextResponse.json({ success: ok });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
