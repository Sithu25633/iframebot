import { NextRequest, NextResponse } from "next/server";
import { fetchLatestSeries, fetchGenreMovies } from "@/lib/cinesubz";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const genre = searchParams.get("genre");

    let series;
    if (genre && genre !== "All" && genre !== "all") {
      series = await fetchGenreMovies(genre, page);
    } else {
      series = await fetchLatestSeries(page);
    }

    return NextResponse.json({
      series,
      page,
      totalPages: 30,
    });
  } catch (error) {
    console.error("Failed to fetch latest TV series", error);
    return NextResponse.json({ series: [], error: "Failed to fetch series" }, { status: 500 });
  }
}

