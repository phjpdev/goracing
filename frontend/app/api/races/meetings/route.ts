import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import redis from "@/lib/redis";

const CACHE_TTL = 60; // 1 minute (HKJC data changes frequently)
const LOCKED_TTL = 60 * 60 * 24 * 7; // 7 days

const HKJC_URL = "https://info.cld.hkjc.com/graphql/base/";

// Must match the exact whitelisted query used by HKJC (query hashing/whitelisting)
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

async function fetchHKJC(variables: Record<string, string>) {
  const res = await fetch(HKJC_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
      "Origin": "https://racing.hkjc.com",
      "Referer": "https://racing.hkjc.com/",
    },
    body: JSON.stringify({
      operationName: "raceMeetings",
      query: QUERY,
      variables,
    }),
    cache: "no-store",
  });
  return res.json();
}

// Local venue codes (not simulcast like S1/S2/S3/S4)
const LOCAL_VENUES = new Set(["ST", "HV"]);

function pickTwoRandomIds(ids: string[]) {
  if (ids.length <= 2) return ids.slice();
  const copy = ids.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, 2);
}

async function getRoleFromRequest(request: NextRequest): Promise<string | undefined> {
  const token = request.cookies.get("auth_token")?.value;
  if (!token) return undefined;

  const jwtKey = process.env.JWT_SECRET_KEY;
  if (!jwtKey) return undefined;

  try {
    const secret = new TextEncoder().encode(jwtKey);
    const { payload } = await jwtVerify(token, secret);
    return payload.role as string | undefined;
  } catch {
    return undefined;
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const date = searchParams.get("date") ?? new Date().toISOString().slice(0, 10);
  const venue = searchParams.get("venue") ?? "ST";
  const cacheKey = `meetings:${date}:${venue}`;

  const role = await getRoleFromRequest(request);
  const isManager = role === "admin" || role === "subadmin";

  // 1. Get meeting payload (Redis cache first)
  let meetings: any[] = [];
  try {
    const cached = await redis.get(cacheKey);
    if (cached) {
      meetings = JSON.parse(cached);
    }
  } catch {
    // Redis unavailable — continue with direct fetch
  }

  // Always enforce venueCode match (prevents wrong venue cached under key)
  meetings = (meetings ?? []).filter(
    (m: { venueCode?: string }) => {
      const vc = m?.venueCode;
      return typeof vc === "string" && LOCAL_VENUES.has(vc) && vc === venue;
    }
  );

  // 2. Fetch from HKJC if cache miss
  if (!meetings || meetings.length === 0) {
    try {
      const data = await fetchHKJC({ date, venueCode: venue });

      if (data.errors) {
        console.error("HKJC API errors:", data.errors);
      }

      // Filter to only local HKJC meetings (exclude simulcast S1/S2/S3/S4)
      meetings = (data.data?.raceMeetings ?? []).filter(
        (m: { venueCode: string }) => LOCAL_VENUES.has(m.venueCode) && m.venueCode === venue
      );

      if (meetings.length > 0) {
        // Cache the raw HKJC payload
        try { await redis.set(cacheKey, JSON.stringify(meetings), "EX", CACHE_TTL); } catch {}
      } else {
        // No local meeting on the requested date — find the active meeting for this venue
        const active: { venueCode: string; date: string }[] =
          data.data?.activeMeetings ?? [];
        const nextMeeting = active.find((m) => m.venueCode === venue);

        if (!nextMeeting) {
          return NextResponse.json([]);
        }

        // Re-fetch with the actual date of the next scheduled meeting
        const fallback = await fetchHKJC({ date: nextMeeting.date, venueCode: venue });

        if (fallback.errors) {
          console.error("HKJC fallback errors:", fallback.errors);
        }

        meetings = (fallback.data?.raceMeetings ?? []).filter(
          (m: { venueCode: string }) => LOCAL_VENUES.has(m.venueCode) && m.venueCode === venue
        );

        // Cache with the actual meeting date as key
        if (meetings.length > 0) {
          const actualKey = `meetings:${nextMeeting.date}:${venue}`;
          try { await redis.set(actualKey, JSON.stringify(meetings), "EX", CACHE_TTL); } catch {}
        }
      }
    } catch (e) {
      console.error("meetings route error:", e);
      return NextResponse.json({ error: "Failed to fetch race meetings" }, { status: 502 });
    }
  }

  const effectiveDate = meetings?.[0]?.date ?? date;
  const lockKey = `locked_races:${effectiveDate}:${venue}`;

  // 3. Determine (and persist) the two locked races for this meeting
  let lockedRaceIds: string[] = [];
  try {
    const raw = await redis.get(lockKey);
    if (raw) lockedRaceIds = JSON.parse(raw);
  } catch {
    // Redis unavailable — we can still serve without locks
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

  // 4. Attach lock metadata and enforce visibility rules
  const withLocks = (meetings ?? []).map((m: any) => {
    const races = (m.races ?? []).map((r: any) => {
      const isLocked = lockedRaceIds.includes(r.id);
      if (isLocked && !isManager) {
        return { ...r, isLocked: true, runners: [] };
      }
      return { ...r, isLocked };
    });
    return { ...m, lockedRaceIds, races };
  });

  return NextResponse.json(withLocks);
}
