import { NextRequest, NextResponse } from "next/server";
import { searchMovies } from "@/lib/cinesubz";
import { searchSinhalaSub } from "@/lib/sinhalasub";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");

  if (!q || q.trim() === "") {
    return NextResponse.json({ results: [] });
  }

  // Multi-source concurrent search: CineSubz + SinhalaSub
  const [csRes, shRes] = await Promise.allSettled([
    searchMovies(q),
    searchSinhalaSub(q),
  ]);

  const cinesubzItems = csRes.status === "fulfilled" ? csRes.value : [];
  const sinhalasubItems = shRes.status === "fulfilled" ? shRes.value : [];

  // Combine and deduplicate
  const seenTitles = new Set<string>();
  const combined = [];

  for (const item of cinesubzItems) {
    const norm = item.title.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (!seenTitles.has(norm)) {
      seenTitles.add(norm);
      combined.push(item);
    }
  }

  for (const item of sinhalasubItems) {
    const norm = item.title.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (!seenTitles.has(norm)) {
      seenTitles.add(norm);
      combined.push(item);
    }
  }

  return NextResponse.json({ results: combined });
}
