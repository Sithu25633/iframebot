import { NextRequest, NextResponse } from "next/server";
import { getAllCartoons, searchCartoons } from "@/lib/cartoons";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "40", 10);
  const category = searchParams.get("category") || "All";

  if (q && q.trim()) {
    const results = searchCartoons(q);
    return NextResponse.json({
      cartoons: results,
      total: results.length,
      page: 1,
      totalPages: 1
    });
  }

  const data = getAllCartoons(limit, page, category);
  return NextResponse.json({
    cartoons: data.items,
    total: data.total,
    page,
    totalPages: data.totalPages,
    limit
  });
}
