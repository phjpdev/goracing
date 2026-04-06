import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8000";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ raceId: string }> }
) {
  const { raceId } = await params;
  const res = await fetch(`${BACKEND_URL}/api/v1/analyses/${raceId}`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return NextResponse.json({ error: data.detail ?? "Failed to fetch analysis" }, { status: res.status });
  }
  return NextResponse.json(data);
}

