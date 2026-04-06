import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8000";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ raceId: string }> }
) {
  const { raceId } = await params;
  const token = (await cookies()).get("auth_token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid request body" }, { status: 400 });

  const res = await fetch(`${BACKEND_URL}/api/v1/analyses/${raceId}/top4`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = Array.isArray(data.detail)
      ? data.detail.map((e: { msg: string }) => e.msg).join(" ")
      : data.detail ?? data.error ?? "Failed to update top4";
    return NextResponse.json({ error: message }, { status: res.status });
  }

  return NextResponse.json(data);
}

