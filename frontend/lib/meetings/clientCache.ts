import type { HKJCMeeting } from "@/types/race-meeting";

const STORAGE_KEY = "goracing:meetings:auto";
const MAX_AGE_MS = 15 * 60 * 1000;

type CachedMeetings = {
  savedAt: number;
  meeting: HKJCMeeting;
};

export function readMeetingsClientCache(): HKJCMeeting | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedMeetings;
    if (!parsed?.meeting || Date.now() - parsed.savedAt > MAX_AGE_MS) {
      sessionStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed.meeting;
  } catch {
    return null;
  }
}

export function writeMeetingsClientCache(meeting: HKJCMeeting) {
  if (typeof window === "undefined") return;
  try {
    const payload: CachedMeetings = { savedAt: Date.now(), meeting };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // quota / private mode
  }
}
