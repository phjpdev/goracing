import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import redis from "@/lib/redis";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY ?? "";
const GEMINI_MODEL = process.env.GEMINI_MODEL ?? "gemini-2.5-flash-lite";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8000";
const LOCKED_TTL = 60 * 60 * 24 * 7; // 7 days

type RunnerInput = {
  no: string;
  name_en: string;
  jockey: { name_en: string };
  trainer: { name_en: string };
  barrierDrawNumber: string;
  handicapWeight: string;
  currentRating: string;
  last6run: string;
  winOdds: string;
  status: string;
};

type RaceInput = {
  id: string;
  no: number;
  raceName_en: string;
  distance: number;
  go_en: string;
  raceClass_en: string;
  raceCourse: { description_en: string };
  raceTrack: { description_en: string };
  runners: RunnerInput[];
};

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

function buildPrompt(race: RaceInput): string {
  const runnersText = race.runners
    .filter((r) => r.status !== "Scratched")
    .map(
      (r) =>
        `No.${r.no} ${r.name_en} | Jockey: ${r.jockey.name_en} | Trainer: ${r.trainer.name_en} | Draw: ${r.barrierDrawNumber} | Weight: ${r.handicapWeight}lbs | Rating: ${r.currentRating} | Last6: ${r.last6run || "N/A"} | Odds: ${r.winOdds || "N/A"}`
    )
    .join("\n");

  return `你是賽馬分析世界第一的專家。請用專業角度深入分析以下香港賽馬會賽事。

賽事資料：
- 賽事名稱：${race.raceName_en}
- 場次：第${race.no}場
- 距離：${race.distance}米
- 場地狀況：${race.go_en || "N/A"}
- 賽事級別：${race.raceClass_en || "N/A"}
- 跑道：${race.raceCourse?.description_en || "N/A"} ${race.raceTrack?.description_en || ""}

參賽馬匹：
${runnersText}

請從以下多個角度分析每匹馬的勝算：
1. 近績表現 (Last 6 runs pattern)
2. 檔位優劣 (Barrier draw advantage at this distance/track)
3. 負磅影響 (Weight carried vs rating)
4. 騎師/練馬師組合 (Jockey-trainer combination strength)
5. 賠率反映的市場信心 (Market confidence from odds)
6. 場地適性 (Going preference)

你必須嚴格按照以下JSON格式回覆，不要加任何其他文字或markdown：
{
  "topPicks": [
    {
      "no": "馬匹編號",
      "name": "馬匹英文名",
      "winPct": "勝率百分比，例如 32.5%",
      "speed": 評分0-100的數字,
      "class": 評分0-100的數字,
      "surface": 評分0-100的數字,
      "distance": 評分0-100的數字,
      "form": 評分0-100的數字,
      "analysis": "一句話英文分析原因"
    }
  ],
  "overallWinPct": 最高勝率馬匹的勝率數字（不含%）,
  "riskLevel": "LOW 或 MEDIUM 或 HIGH"
}

topPicks 必須包含所有非退出馬匹，按勝率從高到低排列。
所有勝率加起來必須等於100%。
請確保分析合理且基於數據。`;
}

export async function POST(request: NextRequest) {
  if (!GEMINI_API_KEY) {
    return NextResponse.json({ error: "Gemini API key not configured" }, { status: 500 });
  }

  try {
    const body = await request.json();
    const race: RaceInput = body.race ?? body;
    const date: string = body.date ?? "";
    const venue: string = body.venue ?? "";

    // 0. Enforce locked race visibility (admin/subadmin only)
    if (race?.id && date && venue) {
      const lockKey = `locked_races:${date}:${venue}`;
      let lockedRaceIds: string[] = [];
      try {
        const raw = await redis.get(lockKey);
        if (raw) lockedRaceIds = JSON.parse(raw);
      } catch {
        // ignore
      }

      // If locks aren't created yet, try to derive them from cached meeting data
      if (!lockedRaceIds || lockedRaceIds.length === 0) {
        try {
          const meetingRaw = await redis.get(`meetings:${date}:${venue}`);
          if (meetingRaw) {
            const meetings = JSON.parse(meetingRaw);
            const raceIds: string[] = (meetings?.[0]?.races ?? []).map((r: any) => r.id).filter(Boolean);
            lockedRaceIds = pickTwoRandomIds(raceIds);
            if (lockedRaceIds.length > 0) {
              await redis.set(lockKey, JSON.stringify(lockedRaceIds), "EX", LOCKED_TTL);
            }
          }
        } catch {
          // ignore
        }
      }

      if (lockedRaceIds?.includes(race.id)) {
        const role = await getRoleFromRequest(request);
        const isManager = role === "admin" || role === "subadmin";
        if (!isManager) {
          return NextResponse.json({ error: "請升級VVIP" }, { status: 403 });
        }
      }
    }

    // 1. Check PostgreSQL cache via backend API
    if (race.id) {
      try {
        const cacheRes = await fetch(`${BACKEND_URL}/api/v1/analyses/${race.id}`);
        if (cacheRes.ok) {
          const cached = await cacheRes.json();
          console.log(`[ANALYZE] Cache hit for ${race.id}`);
          return NextResponse.json(cached.analysis_json);
        }
      } catch {
        // Backend unavailable — continue to Gemini
      }
    }

    // 2. Call Gemini AI with retry for rate limits
    console.log(`[ANALYZE] Cache miss for ${race.id} — calling Gemini`);
    const prompt = buildPrompt(race);
    const geminiBody = JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 16384,
        responseMimeType: "application/json",
      },
    });

    let geminiRes: Response | null = null;
    let lastError = "";

    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        geminiRes = await fetch(GEMINI_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: geminiBody,
        });

        if (geminiRes.ok) break;

        const errData = await geminiRes.json().catch(() => null);
        lastError = errData?.error?.message ?? `HTTP ${geminiRes.status}`;

        if (lastError.includes("location is not supported")) {
          return NextResponse.json(
            { error: "Gemini API is not available in your server's region." },
            { status: 503 }
          );
        }

        // Retry on rate limit (429) or server overload (503)
        if (geminiRes.status === 429 || geminiRes.status === 503) {
          console.log(`[ANALYZE] Gemini rate limited (attempt ${attempt + 1}/3), retrying in ${(attempt + 1) * 5}s...`);
          await new Promise((r) => setTimeout(r, (attempt + 1) * 5000));
          continue;
        }

        // Non-retryable error
        break;
      } catch (fetchErr) {
        lastError = (fetchErr as Error).message;
        console.error(`[ANALYZE] Gemini fetch error (attempt ${attempt + 1}/3):`, lastError);
        await new Promise((r) => setTimeout(r, (attempt + 1) * 3000));
      }
    }

    if (!geminiRes || !geminiRes.ok) {
      console.error("Gemini API failed after retries:", lastError);
      return NextResponse.json({ error: `AI analysis failed: ${lastError}` }, { status: 502 });
    }

    const geminiData = await geminiRes.json();
    const finishReason = geminiData?.candidates?.[0]?.finishReason;
    const text = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    if (!text) {
      console.error("Gemini returned empty response. finishReason:", finishReason);
      return NextResponse.json({ error: "AI returned empty analysis" }, { status: 502 });
    }

    const cleaned = text.replace(/```json\n?|```\n?/g, "").trim();

    try {
      const analysis = JSON.parse(cleaned);

      // 3. Save to PostgreSQL via backend API (fire-and-forget)
      if (race.id) {
        fetch(`${BACKEND_URL}/api/v1/analyses/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            race_id: race.id,
            race_date: date,
            venue_code: venue,
            analysis_json: analysis,
          }),
        }).catch((e) => console.error("Failed to cache analysis:", e));
      }

      return NextResponse.json(analysis);
    } catch (parseErr) {
      console.error("Failed to parse Gemini JSON. finishReason:", finishReason, "text length:", text.length);
      console.error("Raw text (first 500 chars):", text.slice(0, 500));
      return NextResponse.json({ error: "AI returned invalid analysis format. Please try again." }, { status: 502 });
    }
  } catch (e) {
    console.error("Analyze route error:", e);
    return NextResponse.json({ error: "Failed to analyze race" }, { status: 500 });
  }
}
