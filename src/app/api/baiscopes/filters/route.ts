import { NextResponse } from "next/server";
import { getBaiscopesFilters } from "@/lib/baiscopes";

export const dynamic = "force-dynamic";

export async function GET() {
  const { genres, languages, countries } = getBaiscopesFilters();
  return NextResponse.json({ genres, languages, countries });
}
