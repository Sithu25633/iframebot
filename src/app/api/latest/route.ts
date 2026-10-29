import { NextRequest, NextResponse } from "next/server";
import { fetchLatestMovies, fetchLatestSeries, fetchGenreMovies } from "@/lib/cinesubz";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const genre = searchParams.get("genre");
  const page = parseInt(searchParams.get("page") || "1", 10);

  let movies;
  if (genre && genre !== "All" && genre !== "all") {
    movies = await fetchGenreMovies(genre, page);
  } else if (type === "series") {
    movies = await fetchLatestSeries(page);
  } else {
    movies = await fetchLatestMovies(page);
  }

  return NextResponse.json({
    movies,
    page,
    totalPages: 50,
  });
}

