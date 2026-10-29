import { NextResponse } from "next/server";
import { saveVipSubmission, setFirestoreUserVip, getFirestoreUser } from "@/lib/firestore";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, userName, phone, seriesTitle, screenshotBase64 } = body;

    if (!phone) {
      return NextResponse.json({ success: false, error: "Phone number is required" }, { status: 400 });
    }

    // Save submission with image in Cloud Firestore
    const submission = await saveVipSubmission({
      userId: userId || "",
      userName: userName || "Guest User",
      phone,
      seriesTitle: seriesTitle || "TV Series",
      screenshotUrl: screenshotBase64 || "",
    });

    // If registered user, update VIP status immediately or mark pending
    if (userId) {
      await setFirestoreUserVip(userId, true);
    }

    return NextResponse.json({
      success: true,
      vip: true,
      submissionId: submission.id,
      phone,
    });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
