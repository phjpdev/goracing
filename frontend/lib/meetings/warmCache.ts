import { warmAllVenueMeetings } from "./hkjcService";

const globalWarmer = globalThis as unknown as { __meetingsWarmerStarted?: boolean };

export function startMeetingsCacheWarmer() {
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
