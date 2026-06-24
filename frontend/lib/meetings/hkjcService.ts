import redis from "@/lib/redis";

const CACHE_TTL = 120;
const STALE_TTL = 60 * 30;
const ACTIVE_DATE_TTL = 60 * 60;
const LOCKED_TTL = 60 * 60 * 24 * 7;
const HKJC_TIMEOUT_MS = 8000;
const LOCAL_VENUES = new Set(["ST", "HV"]);
const VENUE_CODES = ["ST", "HV"] as const;

const HKJC_URL = "https://info.cld.hkjc.com/graphql/base/";

type MeetingsCacheEntry = {
  value: any[];
  expiresAt: number;
  staleExpiresAt: number;
};

type ActiveDateEntry = { date: string; expiresAt: number };

const globalForMeetings = globalThis as unknown as {
  __meetingsMemCache?: Map<string, MeetingsCacheEntry>;
  __meetingsInflight?: Map<string, Promise<any[]>>;
  __activeDateMem?: Map<string, ActiveDateEntry>;
};

const meetingsMemCache = globalForMeetings.__meetingsMemCache ?? new Map<string, MeetingsCacheEntry>();
const meetingsInflight = globalForMeetings.__meetingsInflight ?? new Map<string, Promise<any[]>>();
const activeDateMem = globalForMeetings.__activeDateMem ?? new Map<string, ActiveDateEntry>();

if (process.env.NODE_ENV !== "production") {
  globalForMeetings.__meetingsMemCache = meetingsMemCache;
  globalForMeetings.__meetingsInflight = meetingsInflight;
  globalForMeetings.__activeDateMem = activeDateMem;
}

const QUERY = `
fragment raceFragment on Race {
  id
  no
  status
  raceName_en
  raceName_ch
  postTime
  country_en
  country_ch
  distance
  wageringFieldSize
  go_en
  go_ch
  ratingType
  raceTrack {
    description_en
    description_ch
  }
  raceCourse {
    description_en
    description_ch
    displayCode
  }
  claCode
  raceClass_en
  raceClass_ch
  judgeSigns {
    value_en
  }
}

fragment racingBlockFragment on RaceMeeting {
  jpEsts: pmPools(
    oddsTypes: [WIN, PLA, TCE, TRI, FF, QTT, DT, TT, SixUP]
    filters: ["jackpot", "estimatedDividend"]
  ) {
    leg {
      number
      races
    }
    oddsType
    jackpot
    estimatedDividend
    mergedPoolId
  }
  poolInvs: pmPools(
    oddsTypes: [WIN, PLA, QIN, QPL, CWA, CWB, CWC, IWN, FCT, TCE, TRI, FF, QTT, DBL, TBL, DT, TT, SixUP]
  ) {
    id
    leg {
      races
    }
  }
  penetrometerReadings(filters: ["first"]) {
    reading
    readingTime
  }
  hammerReadings(filters: ["first"]) {
    reading
    readingTime
  }
  changeHistories(filters: ["top3"]) {
    type
    time
    raceNo
    runnerNo
    horseName_ch
    horseName_en
    jockeyName_ch
    jockeyName_en
    scratchHorseName_ch
    scratchHorseName_en
    handicapWeight
    scrResvIndicator
  }
}

query raceMeetings($date: String, $venueCode: String) {
  timeOffset {
    rc
  }
  activeMeetings: raceMeetings {
    id
    venueCode
    date
    status
    races {
      no
      postTime
      status
      wageringFieldSize
    }
  }
  raceMeetings(date: $date, venueCode: $venueCode) {
    id
    status
    venueCode
    date
    totalNumberOfRace
    currentNumberOfRace
    dateOfWeek
    meetingType
    totalInvestment
    country {
      code
      namech
      nameen
      seq
    }
    races {
      ...raceFragment
      runners {
        id
        no
        standbyNo
        status
        name_ch
        name_en
        horse {
          id
          code
        }
        color
        barrierDrawNumber
        handicapWeight
        currentWeight
        currentRating
        internationalRating
        gearInfo
        racingColorFileName
        allowance
        trainerPreference
        last6run
        saddleClothNo
        trumpCard
        priority
        finalPosition
        deadHeat
        winOdds
        jockey {
          code
          name_en
          name_ch
        }
        trainer {
          code
          name_en
          name_ch
        }
      }
    }
    obSt: pmPools(oddsTypes: [WIN, PLA]) {
      leg {
        races
      }
      oddsType
      comingleStatus
    }
    poolInvs: pmPools(
      oddsTypes: [WIN, PLA, QIN, QPL, CWA, CWB, CWC, IWN, FCT, TCE, TRI, FF, QTT, DBL, TBL, DT, TT, SixUP]
    ) {
      id
      leg {
        number
        races
      }
      status
      sellStatus
      oddsType
      investment
      mergedPoolId
      lastUpdateTime
    }
    ...racingBlockFragment
    pmPools(oddsTypes: []) {
      id
    }
    jkcInstNo: foPools(oddsTypes: [JKC], filters: ["top"]) {
      instNo
    }
    tncInstNo: foPools(oddsTypes: [TNC], filters: ["top"]) {
      instNo
    }
  }
}`;

export function todayHK() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Hong_Kong" });
}

function filterByVenue(meetings: any[], venue: string) {
  return (meetings ?? []).filter((m: { venueCode?: string }) => {
    const vc = m?.venueCode;
    return typeof vc === "string" && LOCAL_VENUES.has(vc) && vc === venue;
  });
}

function pickTwoRandomIds(ids: string[]) {
  if (ids.length <= 2) return ids.slice();
  const copy = ids.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, 2);
}

function writeMemCache(cacheKey: string, meetings: any[]) {
  meetingsMemCache.set(cacheKey, {
    value: meetings,
    expiresAt: Date.now() + CACHE_TTL * 1000,
    staleExpiresAt: Date.now() + STALE_TTL * 1000,
  });
}

async function writeRedisCache(cacheKey: string, staleKey: string, meetings: any[]) {
  try {
    await Promise.all([
      redis.set(cacheKey, JSON.stringify(meetings), "EX", CACHE_TTL),
      redis.set(staleKey, JSON.stringify(meetings), "EX", STALE_TTL),
    ]);
  } catch {
    // Redis unavailable
  }
}

async function persistMeetings(requestedDate: string, fetchedDate: string, venue: string, meetings: any[]) {
  const pairs: Array<[string, string]> = [
    [`meetings:${fetchedDate}:${venue}`, `meetings_stale:${fetchedDate}:${venue}`],
  ];
  if (fetchedDate !== requestedDate) {
    pairs.push([`meetings:${requestedDate}:${venue}`, `meetings_stale:${requestedDate}:${venue}`]);
  }
  await Promise.all(pairs.map(([cacheKey, staleKey]) => writeRedisCache(cacheKey, staleKey, meetings)));
  for (const [cacheKey] of pairs) {
    writeMemCache(cacheKey, meetings);
  }
}

async function readActiveMeetingDate(venue: string): Promise<string | null> {
  const mem = activeDateMem.get(venue);
  if (mem && mem.expiresAt > Date.now()) return mem.date;

  try {
    const raw = await redis.get(`active_meeting_date:${venue}`);
    if (raw) {
      activeDateMem.set(venue, { date: raw, expiresAt: Date.now() + ACTIVE_DATE_TTL * 1000 });
      return raw;
    }
  } catch {
    // ignore
  }
  return null;
}

async function writeActiveMeetingDates(activeMeetings: Array<{ venueCode?: string; date?: string }>) {
  for (const m of activeMeetings ?? []) {
    if (!m?.venueCode || !m?.date || !LOCAL_VENUES.has(m.venueCode)) continue;
    activeDateMem.set(m.venueCode, {
      date: m.date,
      expiresAt: Date.now() + ACTIVE_DATE_TTL * 1000,
    });
    try {
      await redis.set(`active_meeting_date:${m.venueCode}`, m.date, "EX", ACTIVE_DATE_TTL);
    } catch {
      // ignore
    }
  }
}

async function fetchHKJC(variables: Record<string, string>) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), HKJC_TIMEOUT_MS);
  try {
    const res = await fetch(HKJC_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Origin: "https://racing.hkjc.com",
        Referer: "https://racing.hkjc.com/",
        "User-Agent": "Mozilla/5.0",
      },
      body: JSON.stringify({
        operationName: "raceMeetings",
        query: QUERY,
        variables,
      }),
      cache: "no-store",
      signal: controller.signal,
    });

    const raw = await res.text();
    let json: any;
    try {
      json = JSON.parse(raw);
    } catch {
      throw new Error(`HKJC non-JSON response (status ${res.status})`);
    }

    if (!res.ok) {
      const msg = json?.error ?? json?.message ?? `HKJC status ${res.status}`;
      throw new Error(msg);
    }
    return json;
  } finally {
    clearTimeout(t);
  }
}

async function readCachedMeetings(
  date: string,
  venue: string
): Promise<{ meetings: any[]; freshness: "fresh" | "stale" | "miss" }> {
  const cacheKey = `meetings:${date}:${venue}`;
  const staleKey = `meetings_stale:${date}:${venue}`;
  const now = Date.now();

  const mem = meetingsMemCache.get(cacheKey);
  if (mem) {
    if (mem.expiresAt > now) {
      return { meetings: filterByVenue(mem.value, venue), freshness: "fresh" };
    }
    if (mem.staleExpiresAt > now) {
      return { meetings: filterByVenue(mem.value, venue), freshness: "stale" };
    }
    meetingsMemCache.delete(cacheKey);
  }

  try {
    const [cached, stale] = await Promise.all([
      redis.get(cacheKey).catch(() => null),
      redis.get(staleKey).catch(() => null),
    ]);

    if (cached) {
      const parsed = JSON.parse(cached);
      const meetings = filterByVenue(parsed, venue);
      if (meetings.length > 0) {
        writeMemCache(cacheKey, parsed);
        return { meetings, freshness: "fresh" };
      }
    }

    if (stale) {
      const parsed = JSON.parse(stale);
      const meetings = filterByVenue(parsed, venue);
      if (meetings.length > 0) {
        writeMemCache(cacheKey, parsed);
        return { meetings, freshness: "stale" };
      }
    }
  } catch {
    // Redis unavailable
  }

  return { meetings: [], freshness: "miss" };
}

async function readCachedMeetingsForVenue(
  requestedDate: string,
  venue: string
): Promise<{ meetings: any[]; freshness: "fresh" | "stale" | "miss" }> {
  const activeDate = await readActiveMeetingDate(venue);
  const dates = Array.from(new Set([activeDate, requestedDate].filter((d): d is string => !!d)));

  let best: { meetings: any[]; freshness: "fresh" | "stale" | "miss" } = {
    meetings: [],
    freshness: "miss",
  };

  for (const d of dates) {
    const result = await readCachedMeetings(d, venue);
    if (result.meetings.length === 0) continue;
    if (result.freshness === "fresh") return result;
    if (best.meetings.length === 0) best = result;
  }

  return best;
}

export async function fetchMeetingsFromHKJC(requestedDate: string, venue: string): Promise<any[]> {
  const inflightKey = `${requestedDate}:${venue}`;
  const existing = meetingsInflight.get(inflightKey);
  if (existing) return existing;

  const promise = (async () => {
    const activeDate = await readActiveMeetingDate(venue);
    const datesToTry = Array.from(new Set([activeDate, requestedDate].filter((d): d is string => !!d)));
    let lastActiveMeetings: Array<{ venueCode: string; date: string }> = [];

    for (const tryDate of datesToTry) {
      const data = await fetchHKJC({ date: tryDate, venueCode: venue });
      if (data.errors) console.error("HKJC API errors:", data.errors);

      const activeMeetings = data.data?.activeMeetings ?? [];
      if (activeMeetings.length > 0) {
        lastActiveMeetings = activeMeetings;
        await writeActiveMeetingDates(activeMeetings);
      }

      const meetings = filterByVenue(data.data?.raceMeetings ?? [], venue);
      if (meetings.length > 0) {
        await persistMeetings(requestedDate, tryDate, venue, meetings);
        return meetings;
      }
    }

    const nextMeeting = lastActiveMeetings.find((m) => m.venueCode === venue);
    if (nextMeeting && !datesToTry.includes(nextMeeting.date)) {
      const data = await fetchHKJC({ date: nextMeeting.date, venueCode: venue });
      if (data.errors) console.error("HKJC fallback errors:", data.errors);
      await writeActiveMeetingDates(data.data?.activeMeetings ?? []);

      const meetings = filterByVenue(data.data?.raceMeetings ?? [], venue);
      if (meetings.length > 0) {
        await persistMeetings(requestedDate, nextMeeting.date, venue, meetings);
        return meetings;
      }
    }

    return [];
  })();

  meetingsInflight.set(inflightKey, promise);
  try {
    return await promise;
  } finally {
    meetingsInflight.delete(inflightKey);
  }
}

function scheduleRevalidate(date: string, venue: string) {
  void fetchMeetingsFromHKJC(date, venue).catch((e) => {
    console.error(`meetings background refresh failed (${date}/${venue}):`, e);
  });
}

async function resolveMeetings(
  date: string,
  venue: string
): Promise<{ meetings: any[]; revalidate: boolean }> {
  const cached = await readCachedMeetingsForVenue(date, venue);

  if (cached.freshness === "fresh" && cached.meetings.length > 0) {
    return { meetings: cached.meetings, revalidate: false };
  }

  if (cached.freshness === "stale" && cached.meetings.length > 0) {
    scheduleRevalidate(date, venue);
    return { meetings: cached.meetings, revalidate: true };
  }

  const meetings = await fetchMeetingsFromHKJC(date, venue);
  return { meetings, revalidate: false };
}

async function resolveAutoMeetings(
  date: string
): Promise<{ venue: string; meetings: any[]; revalidate: boolean }> {
  const cached = await Promise.all(
    VENUE_CODES.map(async (code) => ({
      venue: code,
      ...(await readCachedMeetingsForVenue(date, code)),
    }))
  );

  const freshHit = cached.find((c) => c.meetings.length > 0 && c.freshness === "fresh");
  if (freshHit) {
    return { venue: freshHit.venue, meetings: freshHit.meetings, revalidate: false };
  }

  const staleHit = cached.find((c) => c.meetings.length > 0 && c.freshness === "stale");
  if (staleHit) {
    scheduleRevalidate(date, staleHit.venue);
    return { venue: staleHit.venue, meetings: staleHit.meetings, revalidate: true };
  }

  return new Promise((resolve, reject) => {
    let pending = VENUE_CODES.length;
    let settled = false;
    const errors: unknown[] = [];

    for (const code of VENUE_CODES) {
      fetchMeetingsFromHKJC(date, code)
        .then((meetings) => {
          if (!settled && meetings.length > 0) {
            settled = true;
            resolve({ venue: code, meetings, revalidate: false });
            return;
          }
          pending -= 1;
          if (pending === 0 && !settled) {
            resolve({ venue: "ST", meetings: [], revalidate: false });
          }
        })
        .catch((e) => {
          errors.push(e);
          pending -= 1;
          if (pending === 0 && !settled) {
            if (errors.length === VENUE_CODES.length) reject(errors[0]);
            else resolve({ venue: "ST", meetings: [], revalidate: false });
          }
        });
    }
  });
}

async function attachLocks(meetings: any[], date: string, venue: string, isManager: boolean) {
  const effectiveDate = meetings?.[0]?.date ?? date;
  const effectiveVenue = meetings?.[0]?.venueCode ?? venue;
  const lockKey = `locked_races:${effectiveDate}:${effectiveVenue}`;

  let lockedRaceIds: string[] = [];
  try {
    const raw = await redis.get(lockKey);
    if (raw) lockedRaceIds = JSON.parse(raw);
  } catch {
    // Redis unavailable
  }

  if (!lockedRaceIds || lockedRaceIds.length === 0) {
    const raceIds: string[] = (meetings?.[0]?.races ?? []).map((r: any) => r.id).filter(Boolean);
    lockedRaceIds = pickTwoRandomIds(raceIds);
    try {
      if (lockedRaceIds.length > 0) {
        await redis.set(lockKey, JSON.stringify(lockedRaceIds), "EX", LOCKED_TTL);
      }
    } catch {
      // ignore
    }
  }

  return (meetings ?? []).map((m: any) => {
    const races = (m.races ?? []).map((r: any) => {
      const isLocked = lockedRaceIds.includes(r.id);
      if (isLocked && !isManager) {
        return { ...r, isLocked: true, runners: [] };
      }
      return { ...r, isLocked };
    });
    return { ...m, lockedRaceIds, races };
  });
}

function stripRunnersForList(meetings: any[]) {
  return meetings.map((m) => ({
    ...m,
    races: (m.races ?? []).map((r: any) => {
      const { runners: _runners, ...rest } = r;
      return rest;
    }),
  }));
}

export type MeetingsResult = {
  body: any[];
  cacheStatus: "hit" | "stale" | "miss";
};

export async function getMeetingsResult(options: {
  date: string;
  venue: string;
  isManager: boolean;
  list?: boolean;
}): Promise<MeetingsResult> {
  const { date, venue, isManager, list } = options;

  let picked: { venue: string; meetings: any[]; revalidate: boolean };

  if (venue === "auto") {
    picked = await resolveAutoMeetings(date);
  } else {
    const result = await resolveMeetings(date, venue);
    picked = { venue, ...result };
  }

  const withLocks = await attachLocks(picked.meetings, date, picked.venue, isManager);
  const body = list ? stripRunnersForList(withLocks) : withLocks;
  const cacheStatus =
    picked.revalidate ? "stale" : picked.meetings.length > 0 ? "hit" : "miss";

  return { body, cacheStatus };
}

export async function warmAllVenueMeetings() {
  const date = todayHK();
  await Promise.all(VENUE_CODES.map((venue) => fetchMeetingsFromHKJC(date, venue).catch(() => [])));
}
