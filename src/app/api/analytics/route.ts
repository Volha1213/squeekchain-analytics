import { NextRequest, NextResponse } from "next/server";
import { getAnalytics } from "@/lib/sources";
import type { Range } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const range = params.get("range") ?? "7d";
  if (
    !["24h", "7d", "30d"].includes(range) ||
    params.getAll("range").length > 1 ||
    [...params.keys()].some((k) => k !== "range")
  ) {
    return NextResponse.json(
      { error: "Use range=24h, 7d, or 30d" },
      { status: 400 },
    );
  }
  return NextResponse.json(await getAnalytics(range as Range), {
    headers: { "Cache-Control": "no-store" },
  });
}
