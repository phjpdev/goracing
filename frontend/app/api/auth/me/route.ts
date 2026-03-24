import { jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8000";

export async function GET() {
  const token = (await cookies()).get("auth_token")?.value;
  if (!token) return NextResponse.json({ authenticated: false });

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET_KEY ?? "");
    const { payload } = await jwtVerify(token, secret);

    // Fetch full user profile from backend to get vip_expiry_date
    let vipExpiryDate: string | null = null;
    try {
      const res = await fetch(`${BACKEND_URL}/api/v1/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const user = await res.json();
        vipExpiryDate = user.vip_expiry_date ?? null;
      }
    } catch {
      // Backend unreachable — continue without VIP info
    }

    return NextResponse.json({
      authenticated: true,
      role: payload.role,
      vip_expiry_date: vipExpiryDate,
    });
  } catch {
    return NextResponse.json({ authenticated: false });
  }
}
