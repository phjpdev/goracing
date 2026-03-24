import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8000";

export async function GET() {
  const token = (await cookies()).get("auth_token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const res = await fetch(`${BACKEND_URL}/api/v1/users`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) return NextResponse.json({ error: data.detail ?? "Failed" }, { status: res.status });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const token = (await cookies()).get("auth_token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const res = await fetch(`${BACKEND_URL}/api/v1/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) {
    if (Array.isArray(data.detail)) {
      const message = data.detail.map((e: { msg: string }) => e.msg).join(" ");
      return NextResponse.json({ error: message }, { status: res.status });
    }
    return NextResponse.json({ error: data.detail ?? "Failed to create user" }, { status: res.status });
  }
  return NextResponse.json(data, { status: 201 });
}
