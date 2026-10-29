import { NextResponse } from "next/server";
import { upsertUser, logRequest } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phone, deviceId, image } = body;

    if (!email || !deviceId) {
      return NextResponse.json({ error: "Missing email or deviceId" }, { status: 400 });
    }

    const { user, error } = await upsertUser({
      name: name || email.split("@")[0],
      email,
      phone,
      deviceId,
      image,
    });

    if (error) {
      return NextResponse.json({ error, user }, { status: 403 });
    }

    return NextResponse.json({ success: true, user });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
