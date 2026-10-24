import { warmAllVenueMeetings } from "./hkjcService";

const globalWarmer = globalThis as unknown as { __meetingsWarmerStarted?: boolean };

export function startMeetingsCacheWarmer() {
  // Escape hatch for when the HKJC feed is unreachable (e.g. the upstream
  // allowlist is rejecting this server). Polling a blocked endpoint every
  // minute achieves nothing, so this lets us switch it off without a rebuild.
  if (process.env.DISABLE_MEETINGS_WARMER === "1") {
    console.log("[meetings-warmer] disabled via DISABLE_MEETINGS_WARMER=1");
    return;
  }

  if (globalWarmer.__meetingsWarmerStarted) return;
  globalWarmer.__meetingsWarmerStarted = true;

  const run = () => {
    void warmAllVenueMeetings().catch((e) => {
      console.error("[meetings-warmer]", e);
    });
  };

  run();
  setInterval(run, 60_000);
}
