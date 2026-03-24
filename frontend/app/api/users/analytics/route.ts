import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8000";

export async function GET(request: NextRequest) {
  const token = (await cookies()).get("auth_token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const date = request.nextUrl.searchParams.get("date") ?? "";
  const qs = date ? `?date=${date}` : "";

  const res = await fetch(`${BACKEND_URL}/api/v1/users/analytics${qs}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) return NextResponse.json({ error: data.detail ?? "Failed" }, { status: res.status });
  return NextResponse.json(data);
}
