import { NextResponse } from "next/server";
import { warmAllVenueMeetings } from "@/lib/meetings/hkjcService";

export async function GET() {
  // Same kill switch as the in-process warmer. This route is the one the
  // container entrypoint polls, so the flag has to be honoured here too.
  if (process.env.DISABLE_MEETINGS_WARMER === "1") {
    return NextResponse.json({ ok: false, skipped: "warmer disabled" });
  }

  await warmAllVenueMeetings();
  return NextResponse.json({ ok: true });
}
