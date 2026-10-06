import { NextRequest, NextResponse } from "next/server";
import { getMeetingsResult } from "@/lib/meetings/hkjcService";

const LOCAL_VENUES = new Set(["ST", "HV"]);

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const date = searchParams.get("date") ?? new Date().toISOString().slice(0, 10);
  const venueParam = searchParams.get("venue") ?? "ST";
  const list = searchParams.get("list") === "1";

  if (venueParam !== "auto" && !LOCAL_VENUES.has(venueParam)) {
    return NextResponse.json({ error: "Invalid venue" }, { status: 400 });
  }

  try {
    const { body, cacheStatus } = await getMeetingsResult({
      date,
      venue: venueParam,
      list,
    });

    return NextResponse.json(body, {
      headers: {
        "Cache-Control": cacheStatus === "hit" ? "private, max-age=30" : "private, no-cache",
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch race meetings" }, { status: 502 });
  }
}
