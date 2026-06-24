import { NextResponse } from "next/server";
import { warmAllVenueMeetings } from "@/lib/meetings/hkjcService";

export async function GET() {
  await warmAllVenueMeetings();
  return NextResponse.json({ ok: true });
}
