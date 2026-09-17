import type { HKJCRace } from "@/types/race-meeting";

/**
 * A race counts as past once it has been run — either HKJC has published a
 * result, or its post time has gone by. The post-time fallback matters because
 * upstream status can lag behind the actual running of the race.
 */
export function isPastRace(race: Pick<HKJCRace, "status" | "postTime">, now: number = Date.now()): boolean {
  // HKJC reports "RESULT" on the live feed; accept "RESULTED" too in case the
  // upstream spelling varies.
  if (race.status?.toUpperCase().startsWith("RESULT")) return true;
  if (!race.postTime) return false;
  const post = new Date(race.postTime).getTime();
  return !Number.isNaN(post) && post <= now;
}

/**
 * Results of past races are admin-only. Members — VIP included — and subadmins
 * are blocked, so this is deliberately stricter than the isManager check used
 * for VVIP-locked races.
 */
export function canViewPastRaces(role: string | undefined): boolean {
  return role === "admin";
}
