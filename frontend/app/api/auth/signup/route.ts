import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8000";
const TOKEN_MAX_AGE = 60 * 60 * 24 * 7;

export async function POST(request: Request) {
  const body = await request.json();

  let res: Response;
  try {
    res = await fetch(`${BACKEND_URL}/api/v1/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to reach the authentication server. Please try again." },
      { status: 503 }
    );
  }

  const data = await res.json();

  if (!res.ok) {
    // Pydantic validation errors come as an array; flatten to a readable string
    if (Array.isArray(data.detail)) {
      const message = data.detail.map((e: { msg: string }) => e.msg).join(" ");
      return NextResponse.json({ error: message }, { status: res.status });
    }
    return NextResponse.json(
      { error: data.detail ?? "Sign up failed." },
      { status: res.status }
    );
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set("auth_token", data.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: TOKEN_MAX_AGE,
    path: "/",
  });
  return response;
}
