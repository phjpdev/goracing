import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8000";
export const dynamic = "force-dynamic";

// Streams the admin "Last Matches" Excel export from the backend.
// The backend enforces admin access from the forwarded token.
export async function GET(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const lang = request.nextUrl.searchParams.get("lang") === "zh" ? "zh" : "en";

  const res = await fetch(`${BACKEND_URL}/api/v1/analyses/export?lang=${lang}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!res.ok || !res.body) {
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(
      { error: typeof data.detail === "string" ? data.detail : "Failed to export analyses" },
      { status: res.ok ? 502 : res.status }
    );
  }

  return new NextResponse(res.body, {
    headers: {
      "Content-Type":
        res.headers.get("content-type") ??
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition":
        res.headers.get("content-disposition") ?? 'attachment; filename="goracing-last-matches.xlsx"',
      "Cache-Control": "no-store",
    },
  });
}
