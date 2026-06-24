import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { getMeetingsResult } from "@/lib/meetings/hkjcService";

const LOCAL_VENUES = new Set(["ST", "HV"]);

async function getRoleFromRequest(request: NextRequest): Promise<string | undefined> {
  const token = request.cookies.get("auth_token")?.value;
  if (!token) return undefined;

  const jwtKey = process.env.JWT_SECRET_KEY;
  if (!jwtKey) return undefined;

  try {
    const secret = new TextEncoder().encode(jwtKey);
    const { payload } = await jwtVerify(token, secret);
    return payload.role as string | undefined;
  } catch {
    return undefined;
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const date = searchParams.get("date") ?? new Date().toISOString().slice(0, 10);
  const venueParam = searchParams.get("venue") ?? "ST";
  const list = searchParams.get("list") === "1";

  if (venueParam !== "auto" && !LOCAL_VENUES.has(venueParam)) {
    return NextResponse.json({ error: "Invalid venue" }, { status: 400 });
  }

  const role = await getRoleFromRequest(request);
  const isManager = role === "admin" || role === "subadmin";

  try {
    const { body, cacheStatus } = await getMeetingsResult({
      date,
      venue: venueParam,
      isManager,
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
