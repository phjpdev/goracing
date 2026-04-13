import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8000";
export const dynamic = "force-dynamic";

export async function GET() {
  const res = await fetch(`${BACKEND_URL}/api/v1/analyses/recent`, {
    cache: "no-store",
  });
  const data = await res.json().catch(() => []);
  if (!res.ok) {
    return NextResponse.json(
      { error: "Failed to fetch recent analyses" },
      { status: res.status }
    );
  }
  return NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });
}
