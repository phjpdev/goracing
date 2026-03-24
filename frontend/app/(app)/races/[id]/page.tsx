"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { WinPercentage, SmartRacecard, AnalyticsPanel } from "@/components/features/races";
import { ROUTES } from "@/lib/constants";
import { useLanguage } from "@/lib/context/LanguageContext";
import type { HKJCMeeting, HKJCRace } from "@/types/race-meeting";
import type { Race, RacecardRow } from "@/types";

const RACE_HORSE = "/assets/race-horse.png";

type GeminiPick = {
  no: string;
  name: string;
  winPct: string;
  speed: number;
  class: number;
  surface: number;
  distance: number;
  form: number;
  analysis: string;
};

type GeminiAnalysis = {
  topPicks: GeminiPick[];
  overallWinPct: number;
  riskLevel: string;
};

function formatTime(iso: string) {
  if (!iso) return "-";
  return new Date(iso).toLocaleTimeString("en-HK", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Hong_Kong",
  });
}

function mapToRace(hkjcRace: HKJCRace): Race {
  const runners = hkjcRace.runners?.filter((r) => r.status !== "Scratched") ?? [];
  const odds = runners.map((r) => parseFloat(r.winOdds)).filter((o) => !isNaN(o));
  const minOdds = odds.length > 0 ? Math.min(...odds) : 0;
  const maxOdds = odds.length > 0 ? Math.max(...odds) : 0;

  return {
    id: hkjcRace.id,
    raceNumber: hkjcRace.no,
    name: hkjcRace.raceName_en || `Race ${hkjcRace.no}`,
    venue: `${hkjcRace.raceCourse?.description_en || ""} ${hkjcRace.raceTrack?.description_en || ""}`.trim(),
    time: formatTime(hkjcRace.postTime),
    distance: `${hkjcRace.distance}m`,
    going: hkjcRace.go_en || "-",
    status: hkjcRace.status === "RESULTED" ? "FINISHED" : hkjcRace.status === "GOING" ? "LIVE" : "UPCOMING",
    prizePool: "-",
    fieldSize: `${runners.length} Horses`,
    topFavourite: minOdds > 0 ? minOdds.toFixed(1) : "-",
    longshot: maxOdds > 0 ? maxOdds.toFixed(1) : "-",
  };
}

function mapToRacecard(picks: GeminiPick[], hkjcRace: HKJCRace): RacecardRow[] {
  return picks.map((pick, idx) => {
    const runner = hkjcRace.runners?.find((r) => r.no === pick.no);
    return {
      rank: idx + 1,
      horse: pick.name,
      age: "-",
      sire: pick.analysis,
      jockey: runner?.jockey?.name_en ?? "-",
      trainer: runner?.trainer?.name_en ?? "-",
      turf: hkjcRace.raceCourse?.description_en ?? "-",
      speed: pick.speed,
      class: pick.class,
      winPct: pick.winPct,
      betStatus: idx === 0 ? "Closed" as const : "Accepting" as const,
    };
  });
}

export default function RaceDetailPage() {
  const { t } = useLanguage();
  const params = useParams();
  const searchParams = useSearchParams();
  const raceId = (params?.id as string) ?? "";
  const date = searchParams.get("date") ?? "";
  const venue = searchParams.get("venue") ?? "";

  const [hkjcRace, setHkjcRace] = useState<HKJCRace | null>(null);
  const [analysis, setAnalysis] = useState<GeminiAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [aiError, setAiError] = useState("");
  const [error, setError] = useState("");

  // 1. Fetch HKJC meeting data and find the race
  useEffect(() => {
    if (!date || !venue) {
      setError("missing");
      setLoading(false);
      return;
    }

    fetch(`/api/races/meetings?date=${date}&venue=${venue}`)
      .then((r) => r.json())
      .then((meetings: HKJCMeeting[]) => {
        for (const m of meetings) {
          const found = m.races?.find((r) => r.id === raceId);
          if (found) {
            setHkjcRace(found);
            setLoading(false);
            return;
          }
        }
        setError("notfound");
        setLoading(false);
      })
      .catch(() => {
        setError("failed");
        setLoading(false);
      });
  }, [raceId, date, venue]);

  // 2. Once we have the race, call Gemini for analysis
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (!hkjcRace) return;
    setAnalyzing(true);
    setAiError("");

    fetch("/api/races/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ race: hkjcRace, date, venue }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setAiError(data.error);
        } else {
          setAnalysis(data);
        }
        setAnalyzing(false);
      })
      .catch(() => {
        setAiError(t.races.failedAi);
        setAnalyzing(false);
      });
  }, [hkjcRace, retryCount]);

  // Loading states
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d0d0d] text-white flex items-center justify-center">
        <div className="flex items-center gap-3 text-white/60">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-[#28E88E]" />
          Loading race data…
        </div>
      </div>
    );
  }

  if (error || !hkjcRace) {
    return (
      <div className="min-h-screen bg-[#0d0d0d] text-white flex flex-col items-center justify-center gap-4">
        <p className="text-red-400">
          {error === "missing" ? t.races.missingContext : error === "notfound" ? t.races.raceNotFound : t.races.failedToLoad}
        </p>
        <Link href={ROUTES.MATCHES} className="text-[#28E88E] hover:underline">
          {t.races.back}
        </Link>
      </div>
    );
  }

  const race = mapToRace(hkjcRace);
  const racecard = analysis ? mapToRacecard(analysis.topPicks, hkjcRace) : [];
  const top4 = racecard.slice(0, 4);

  // Pedigree values from top pick
  const topPick = analysis?.topPicks?.[0];
  const pedigreeValues = topPick
    ? [topPick.surface, topPick.speed, topPick.class, topPick.distance, topPick.form]
    : [0, 0, 0, 0, 0];
  const radarLabels = ["Surface", "Speed", "Class", "Distance", "Form"];

  const winPct = analysis?.overallWinPct ?? 0;
  const donutSegments = analysis?.topPicks
    ? analysis.topPicks.slice(1, 5).map((p) => parseFloat(p.winPct) || 0)
    : [0, 0, 0, 0];

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white">
      <main className="mx-auto w-full max-w-[1600px] space-y-4 px-3 py-4 sm:space-y-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        {/* Back link */}
        <Link
          href={ROUTES.MATCHES}
          className="inline-flex min-h-[44px] min-w-[44px] items-center gap-1.5 font-inter text-sm text-white/80 transition hover:text-white"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {t.races.back}
        </Link>

        {/* Race title block */}
        <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="relative h-10 w-10 shrink-0 flex items-center justify-center">
              <Image src={RACE_HORSE} alt="" width={40} height={40} className="h-10 w-10 object-contain" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-inter text-base sm:text-[18px] text-white/70 leading-tight">Race {race.raceNumber}</p>
              <h1 className="font-inter text-2xl font-bold text-white mt-0.5 leading-tight sm:text-[30px]">
                {race.name}
              </h1>
              <p className="font-inter text-sm sm:text-[16px] text-white/60 mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 leading-tight">
                <span>{race.venue}</span>
                <span className="text-white/40">•</span>
                <span>{race.time}</span>
                <span className="text-white/40">•</span>
                <span>{race.distance}</span>
                <span className="text-white/40">•</span>
                <span className="text-[#28E88E]">{race.going}</span>
              </p>
            </div>
          </div>
          <span
            className="inline-flex shrink-0 items-center justify-center self-start rounded-[44px] p-[1px] w-[99px] h-[29px] min-w-[99px] sm:self-center"
            style={{
              background: "radial-gradient(58.97% 354.93% at 15.38% 13.16%, #28E88E 0%, #168250 100%)",
            }}
          >
            <span
              className="flex h-full w-full items-center justify-center rounded-[43px] font-inter font-medium text-[14px] leading-[100%] tracking-[-0.03em] text-center text-white"
              style={{ padding: "6px 12px", background: "#0d0d0d" }}
            >
              {race.status}
            </span>
          </span>
        </section>

        {/* Stat bar removed */}

        {/* AI Analysis loading */}
        {analyzing && (
          <div className="flex items-center gap-3 rounded-xl border border-[#28E88E]/20 bg-[#1a2e23] p-4">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#28E88E]/30 border-t-[#28E88E]" />
            <span className="text-[#28E88E] font-inter text-sm">{t.races.aiAnalyzing}</span>
          </div>
        )}
        {aiError && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 flex items-center justify-between">
            <p className="text-red-400 font-inter text-sm">{aiError}</p>
            <button
              type="button"
              onClick={() => setRetryCount((c) => c + 1)}
              className="shrink-0 ml-4 px-4 py-1.5 rounded-lg bg-[#28E88E] text-[#020308] text-sm font-semibold hover:bg-[#28E88E]/90 transition"
            >
              {t.races.retry}
            </button>
          </div>
        )}

        {/* Win Percentage + Smart Racecard — side by side */}
        {analysis && racecard.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-[30%_calc(70%-1.5rem)] gap-4 sm:gap-6">
            <WinPercentage racecard={top4} />
            <div className="hidden lg:block">
              <SmartRacecard racecard={racecard} />
            </div>
          </div>
        )}

        {/* Analytics: Pedigree, AI Win, Market Activity */}
        {analysis && (
          <AnalyticsPanel
            pedigreeValues={pedigreeValues}
            radarLabels={radarLabels}
            winPct={winPct}
            donutSegments={donutSegments}
          />
        )}
      </main>
    </div>
  );
}
