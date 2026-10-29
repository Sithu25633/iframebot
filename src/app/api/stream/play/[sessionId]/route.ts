import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/sessionStore";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = params;
    const session = getSession(sessionId);

    if (!session) {
      return new NextResponse(
        JSON.stringify({
          error: "Stream session has expired or does not exist. Sessions are valid for 8 hours.",
          expired: true,
        }),
        {
          status: 410,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const range = request.headers.get("range");
    const headers: Record<string, string> = {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    };

    if (range) {
      headers["Range"] = range;
    }

    const response = await fetch(session.streamUrl, {
      headers,
      method: "GET",
    });

    if (!response.ok && response.status !== 206) {
      // If upstream failed with Range, try without range
      const fallbackResponse = await fetch(session.streamUrl, {
        headers: { "User-Agent": headers["User-Agent"] },
      });
      if (!fallbackResponse.ok) {
        return new NextResponse("Failed to fetch stream from CDN", { status: 502 });
      }
      return new NextResponse(fallbackResponse.body as any, {
        status: fallbackResponse.status,
        headers: {
          "Content-Type": fallbackResponse.headers.get("content-type") || "video/mp4",
          "Accept-Ranges": "bytes",
          "Cache-Control": "public, max-age=3600",
        },
      });
    }

    const responseHeaders = new Headers();
    responseHeaders.set("Content-Type", response.headers.get("content-type") || "video/mp4");
    responseHeaders.set("Accept-Ranges", "bytes");
    responseHeaders.set("Cache-Control", "public, max-age=3600");

    const contentRange = response.headers.get("content-range");
    if (contentRange) {
      responseHeaders.set("Content-Range", contentRange);
    }

    const contentLength = response.headers.get("content-length");
    if (contentLength) {
      responseHeaders.set("Content-Length", contentLength);
    }

    return new NextResponse(response.body as any, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (error: any) {
    console.error("[StreamProxy] Error:", error);
    return new NextResponse("Stream proxy error", { status: 500 });
  }
}

export async function HEAD(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = params;
    const session = getSession(sessionId);

    if (!session) {
      return new NextResponse(null, { status: 410 });
    }

    const response = await fetch(session.streamUrl, {
      method: "HEAD",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      },
    });

    const responseHeaders = new Headers();
    responseHeaders.set("Content-Type", response.headers.get("content-type") || "video/mp4");
    responseHeaders.set("Accept-Ranges", "bytes");

    const contentLength = response.headers.get("content-length");
    if (contentLength) {
      responseHeaders.set("Content-Length", contentLength);
    }

    return new NextResponse(null, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (err) {
    return new NextResponse(null, { status: 500 });
  }
}
