export type LandingMarketPoint = {
  winProb: number;
  odds: number;
  trend: "dropping" | "drifting" | "stable";
};

export type LastLandingAnalytics = {
  version: 1;
  savedAt: string;
  race: {
    id: string;
    date: string;
    venue: string;
    raceNumber?: string;
    name?: string;
  };
  charts: {
    bars: number[]; // e.g. top picks win%
    pedigreeValues: number[]; // 0..100
    radarLabels: string[];
    marketPoints: LandingMarketPoint[];
    overallWinPct?: number;
    donutSegments?: number[];
  };
};

const STORAGE_KEY = "goracing:lastLandingAnalytics:v1";

export function saveLastLandingAnalytics(payload: Omit<LastLandingAnalytics, "version" | "savedAt">) {
  if (typeof window === "undefined") return;
  try {
    const data: LastLandingAnalytics = {
      version: 1,
      savedAt: new Date().toISOString(),
      ...payload,
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore (storage might be unavailable)
  }
}

export function loadLastLandingAnalytics(): LastLandingAnalytics | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as LastLandingAnalytics;
    if (!parsed || parsed.version !== 1) return null;
    if (!parsed.charts || !Array.isArray(parsed.charts.bars) || !Array.isArray(parsed.charts.pedigreeValues)) return null;
    if (!Array.isArray(parsed.charts.marketPoints)) return null;
    return parsed;
  } catch {
    return null;
  }
}

