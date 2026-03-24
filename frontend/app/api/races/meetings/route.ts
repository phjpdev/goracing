import { NextRequest, NextResponse } from "next/server";
import redis from "@/lib/redis";

const CACHE_TTL = 300; // 5 minutes

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
    next: { revalidate: 60 },
  });
  return res.json();
}

// Local venue codes (not simulcast like S1/S2/S3/S4)
const LOCAL_VENUES = new Set(["ST", "HV"]);

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const date = searchParams.get("date") ?? new Date().toISOString().slice(0, 10);
  const venue = searchParams.get("venue") ?? "ST";
  const cacheKey = `meetings:${date}:${venue}`;

  // 1. Check Redis cache
  try {
    const cached = await redis.get(cacheKey);
    if (cached) {
      return NextResponse.json(JSON.parse(cached));
    }
  } catch {
    // Redis unavailable — continue with direct fetch
  }

  // 2. Fetch from HKJC
  try {
    const data = await fetchHKJC({ date, venueCode: venue });

    if (data.errors) {
      console.error("HKJC API errors:", data.errors);
    }

    // Filter to only local HKJC meetings (exclude simulcast S1/S2/S3/S4)
    const meetings: { venueCode: string; date: string }[] =
      (data.data?.raceMeetings ?? []).filter(
        (m: { venueCode: string }) => LOCAL_VENUES.has(m.venueCode)
      );

    if (meetings.length > 0) {
      // Cache and return
      try { await redis.set(cacheKey, JSON.stringify(meetings), "EX", CACHE_TTL); } catch {}
      return NextResponse.json(meetings);
    }

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

    const fallbackMeetings = (fallback.data?.raceMeetings ?? []).filter(
      (m: { venueCode: string }) => LOCAL_VENUES.has(m.venueCode)
    );

    // Cache with the actual meeting date as key
    if (fallbackMeetings.length > 0) {
      const actualKey = `meetings:${nextMeeting.date}:${venue}`;
      try { await redis.set(actualKey, JSON.stringify(fallbackMeetings), "EX", CACHE_TTL); } catch {}
    }

    return NextResponse.json(fallbackMeetings);
  } catch (e) {
    console.error("meetings route error:", e);
    return NextResponse.json({ error: "Failed to fetch race meetings" }, { status: 502 });
  }
}
