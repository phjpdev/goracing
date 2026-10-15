import { jwtVerify } from "jose";
import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8000";
export const dynamic = "force-dynamic";

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

function clampInt(raw: string | null, fallback: number, min: number, max: number) {
  const n = Number.parseInt(raw ?? "", 10);
  if (Number.isNaN(n)) return fallback;
  return Math.min(Math.max(n, min), max);
}

export async function GET(request: NextRequest) {
  // Saved analyses are past-race results, which are admin-only.
  const role = await getRoleFromRequest(request);
  if (role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = request.nextUrl;
  const limit = clampInt(searchParams.get("limit"), 3, 1, 50);
  const offset = clampInt(searchParams.get("offset"), 0, 0, Number.MAX_SAFE_INTEGER);

  const res = await fetch(
    `${BACKEND_URL}/api/v1/analyses/recent?limit=${limit}&offset=${offset}`,
    { cache: "no-store" }
  );
  const data = await res.json().catch(() => []);
  if (!res.ok) {
    return NextResponse.json(
      { error: "Failed to fetch recent analyses" },
      { status: res.status }
    );
  }
  return NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });
}
