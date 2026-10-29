import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/sessionStore";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing session id" }, { status: 400 });
  }

  const session = getSession(id);
  if (!session) {
    return NextResponse.json(
      { error: "Stream session has expired or does not exist", expired: true },
      { status: 410 }
    );
  }

  return NextResponse.json({
    session: {
      id: session.id,
      title: session.title,
      poster: session.poster,
      backdrop: session.backdrop,
      quality: session.quality,
      sizeText: session.sizeText,
      createdAt: session.createdAt,
      expiresAt: session.expiresAt,
      isSeries: session.isSeries,
      season: session.season,
      episode: session.episode,
    },
  });
}
