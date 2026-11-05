import { NextRequest, NextResponse } from "next/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY ?? "";
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";
// Comma-separated models to try, in order, when the main model is overloaded,
// rate limited or retired. e.g. GEMINI_FALLBACK_MODELS=gemini-3.5-flash
const GEMINI_FALLBACK_MODELS = (process.env.GEMINI_FALLBACK_MODELS ?? "")
  .split(",")
  .map((m) => m.trim())
  .filter(Boolean);
const GEMINI_MODELS = Array.from(new Set([GEMINI_MODEL, ...GEMINI_FALLBACK_MODELS]));
const GEMINI_ATTEMPTS_PER_MODEL = 2;

function geminiUrl(model: string) {
  return `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
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
  raceName_ch?: string;
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
        const cacheRes = await fetch(`${BACKEND_URL}/api/v1/analyses/${race.id}`, {
          cache: "no-store",
        });
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

    // Try the main model, then each fallback. A busy model (429/503) gets a short
    // retry before moving on; a retired model (404) is skipped straight away.
    modelLoop: for (const model of GEMINI_MODELS) {
      for (let attempt = 1; attempt <= GEMINI_ATTEMPTS_PER_MODEL; attempt++) {
        const isLastAttempt = attempt === GEMINI_ATTEMPTS_PER_MODEL;
        try {
          geminiRes = await fetch(geminiUrl(model), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: geminiBody,
          });

          if (geminiRes.ok) {
            if (model !== GEMINI_MODEL) console.log(`[ANALYZE] Used fallback model ${model}`);
            break modelLoop;
          }

          const errData = await geminiRes.json().catch(() => null);
          lastError = errData?.error?.message ?? `HTTP ${geminiRes.status}`;

          if (lastError.includes("location is not supported")) {
            return NextResponse.json(
              { error: "Gemini API is not available in your server's region." },
              { status: 503 }
            );
          }

          if (geminiRes.status === 429 || geminiRes.status === 503) {
            console.log(
              `[ANALYZE] ${model} busy (HTTP ${geminiRes.status}, attempt ${attempt}/${GEMINI_ATTEMPTS_PER_MODEL}): ${lastError}`
            );
            if (!isLastAttempt) await sleep(attempt * 5000);
            continue;
          }

          if (geminiRes.status === 404) {
            console.warn(`[ANALYZE] ${model} unavailable (HTTP 404): ${lastError}`);
            continue modelLoop;
          }

          // Bad key, billing, bad request: another model won't help.
          console.error(`[ANALYZE] ${model} failed (HTTP ${geminiRes.status}): ${lastError}`);
          break modelLoop;
        } catch (fetchErr) {
          lastError = (fetchErr as Error).message;
          console.error(`[ANALYZE] ${model} fetch error (attempt ${attempt}/${GEMINI_ATTEMPTS_PER_MODEL}):`, lastError);
          if (!isLastAttempt) await sleep(attempt * 3000);
        }
      }
    }

    if (!geminiRes || !geminiRes.ok) {
      console.error("Gemini API failed after retries:", lastError);
      return NextResponse.json({ error: `AI analysis failed: ${lastError}` }, { status: 502 });
    }

    const geminiData = await geminiRes.json();
    const finishReason = geminiData?.candidates?.[0]?.finishReason;
    // Newer (thinking) models can split the answer over several parts and may
    // include thought parts, so join every non-thought text part.
    const parts: Array<{ text?: string; thought?: boolean }> =
      geminiData?.candidates?.[0]?.content?.parts ?? [];
    const text = parts
      .filter((p) => !p.thought && typeof p.text === "string")
      .map((p) => p.text)
      .join("");

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
            race_name_en: race.raceName_en || null,
            race_name_ch: race.raceName_ch || null,
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
