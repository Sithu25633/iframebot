import { NextRequest, NextResponse } from "next/server";
import { resolveStreamLink } from "@/lib/streamResolver";
import { createSession, pruneExpiredSessions } from "@/lib/sessionStore";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    pruneExpiredSessions();

    const body = await request.json();
    const { url, quality = "720p", isSeries = false, season = 1, episode = 1 } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "Missing or invalid 'url' parameter" }, { status: 400 });
    }

    console.log(`[API Resolve] Resolving stream for URL: ${url} (Q: ${quality})`);

    const result = await resolveStreamLink(url, quality);

    if (!result.success || !result.direct_url) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || "Unable to extract high-speed streaming link for this movie/episode.",
        },
        { status: 422 }
      );
    }

    // Clean title
    const cleanTitle = (result.title || "Movie Stream")
      .replace(/\s*\(?\d{4}\)?\s*Sinhala.*$/i, "")
      .replace(/\|\s*සිංහල.*$/i, "")
      .trim();

    // Create 8-hour session
    const session = createSession({
      title: cleanTitle,
      poster: result.poster || "",
      backdrop: result.backdrop || "",
      sourceUrl: url,
      streamUrl: result.direct_url,
      quality: result.quality || quality,
      sizeText: result.size_text || "",
      isSeries,
      season,
      episode,
    });

    const host = request.headers.get("host") || "localhost:3000";
    const protocol = request.headers.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
    const baseUrl = `${protocol}://${host}`;

    const watchUrl = `/watch/${session.id}`;
    const embedUrl = `/embed/${session.id}`;
    const fullEmbedUrl = `${baseUrl}/embed/${session.id}`;
    const iframeCode = `<iframe src="${fullEmbedUrl}" width="100%" height="100%" frameborder="0" allowfullscreen allow="autoplay; fullscreen; encrypted-media; picture-in-picture"></iframe>`;

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      title: cleanTitle,
      poster: session.poster,
      backdrop: session.backdrop,
      quality: session.quality,
      sizeText: session.sizeText,
      watchUrl,
      embedUrl,
      fullEmbedUrl,
      iframeCode,
      expiresAt: session.expiresAt,
      expiresInHours: 8,
    });
  } catch (error: any) {
    console.error("[API Resolve] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error resolving stream" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");
  const quality = searchParams.get("quality") || "720p";

  if (!url) {
    return NextResponse.json({ error: "Missing 'url' query parameter" }, { status: 400 });
  }

  const postRequest = new NextRequest(request.url, {
    method: "POST",
    headers: request.headers,
    body: JSON.stringify({ url, quality }),
  });

  return POST(postRequest);
}
