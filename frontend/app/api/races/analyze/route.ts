import { NextRequest, NextResponse } from "next/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY ?? "";
const GEMINI_MODEL = process.env.GEMINI_MODEL ?? "gemini-2.5-flash-lite";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8000";

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
