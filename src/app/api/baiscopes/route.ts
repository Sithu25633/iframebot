import { NextRequest, NextResponse } from "next/server";
import { getBaiscopesMovies, searchBaiscopes } from "@/lib/baiscopes";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "24", 10);
  const genre = searchParams.get("genre") || undefined;
  const language = searchParams.get("language") || undefined;
  const country = searchParams.get("country") || undefined;

  if (q && q.trim()) {
    const results = searchBaiscopes(q);
    return NextResponse.json({
      baiscopes: results,
      total: results.length,
      page: 1,
      totalPages: 1,
      limit,
    });
  }

  const data = getBaiscopesMovies(limit, page, genre, language, country);
  return NextResponse.json({
    baiscopes: data.items,
    total: data.total,
    page,
    totalPages: data.totalPages,
    limit,
  });
}
