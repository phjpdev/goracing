export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { startMeetingsCacheWarmer } = await import("@/lib/meetings/warmCache");
    startMeetingsCacheWarmer();
  }
}
