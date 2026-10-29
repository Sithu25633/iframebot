import { NextResponse } from "next/server";
import { pruneExpiredSessions } from "@/lib/sessionStore";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    pruneExpiredSessions();
    return NextResponse.json({
      success: true,
      message: "Expired stream sessions (older than 8 hours) pruned successfully.",
      timestamp: Date.now(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to prune sessions" },
      { status: 500 }
    );
  }
}
