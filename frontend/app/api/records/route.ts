import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8000";

export async function GET() {
  const res = await fetch(`${BACKEND_URL}/api/v1/records/`);
  const data = await res.json();
  if (!res.ok) return NextResponse.json({ error: data.detail ?? "Failed" }, { status: res.status });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const token = (await cookies()).get("auth_token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Read raw body and forward with original content-type (preserves multipart boundary)
  const body = await request.arrayBuffer();
  const contentType = request.headers.get("content-type") ?? "";

  const res = await fetch(`${BACKEND_URL}/api/v1/records/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": contentType,
    },
    body: Buffer.from(body),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = Array.isArray(data.detail)
      ? data.detail.map((e: { msg: string }) => e.msg).join(" ")
      : data.detail ?? "Failed to create record";
    return NextResponse.json({ error: message }, { status: res.status });
  }
  return NextResponse.json(data, { status: 201 });
}
