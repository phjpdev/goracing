"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/lib/context/AuthContext";
import { useLanguage } from "@/lib/context/LanguageContext";
import { ROUTES } from "@/lib/constants";
import { canViewPastRaces } from "@/lib/races/access";

const PAGE_SIZE = 3;

type TopPick = {
  no: string;
  name: string;
  winPct: string;
  speed: number;
  class: number;
  analysis: string;
};

type AnalysisJson = {
  topPicks: TopPick[];
  overallWinPct: number;
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
};

type RaceEntry = {
  race_id: string;
  race_name_en: string | null;
  race_name_ch: string | null;
  analysis_json: AnalysisJson;
  created_at: string;
};

type Meeting = {
  race_date: string;
  venue_code: string;
  analyses: RaceEntry[];
};

const VENUE_LABELS: Record<string, { en: string; zh: string }> = {
  ST: { en: "Sha Tin", zh: "沙田" },
  HV: { en: "Happy Valley", zh: "跑馬地" },
};

const RISK_STYLES: Record<string, string> = {
  LOW: "text-[#28E88E] bg-[#28E88E]/10 border-[#28E88E]/20",
  MEDIUM: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  HIGH: "text-red-400 bg-red-400/10 border-red-400/20",
};

const RANK_COLORS = ["#F7A83B", "#28E88E", "#3B82F6", "#8B5CF6"];

export default function LastMatchesPage() {
  const { t, locale } = useLanguage();
  const { auth, authLoading } = useAuth();
  const isAdmin = canViewPastRaces(auth?.role);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState("");

  const loadPage = useCallback(async (offset: number) => {
    const res = await fetch(`/api/analyses/recent?limit=${PAGE_SIZE}&offset=${offset}`);
    if (!res.ok) throw new Error("failed");
    const data = await res.json();
    if (!Array.isArray(data)) throw new Error("failed");
    return data as Meeting[];
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!isAdmin) {
      setLoading(false);
      return;
    }
    loadPage(0)
      .then((data) => {
        setMeetings(data);
        setHasMore(data.length === PAGE_SIZE);
      })
      .catch(() => setError("Failed to load"))
      .finally(() => setLoading(false));
  }, [authLoading, isAdmin, loadPage]);

  async function handleLoadMore() {
    setLoadingMore(true);
    try {
      const next = await loadPage(meetings.length);
      setMeetings((prev) => [...prev, ...next]);
      setHasMore(next.length === PAGE_SIZE);
    } catch {
      setError("Failed to load");
    } finally {
      setLoadingMore(false);
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0d0d0d] text-white flex items-center justify-center">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-[#28E88E]" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#0d0d0d] text-white flex flex-col items-center justify-center gap-4 px-6">
        <p className="text-amber-200 text-base sm:text-lg font-inter text-center">
          {t.races.pastRaceAdminOnly}
        </p>
        <Link href={ROUTES.MATCHES} className="text-[#28E88E] hover:underline">
          {t.races.back}
        </Link>
      </div>
    );
  }

  function formatDate(dateStr: string) {
    const d = new Date(dateStr);
    return d.toLocaleDateString(locale === "zh-TW" ? "zh-HK" : "en-HK", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    });
  }

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white">
      <main className="mx-auto w-full max-w-[1200px] px-4 py-6 sm:px-6 sm:py-10 lg:px-8 lg:py-12 space-y-8">

        {/* Page header */}
        <div className="flex items-center gap-4">
          <Link
            href={ROUTES.MATCHES}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white transition shrink-0"
            aria-label="Back"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="font-inter text-2xl sm:text-3xl font-bold text-white">
              {locale === "zh-TW" ? "最近賽事分析" : "Last Matches"}
            </h1>
            <p className="text-white/50 text-sm mt-0.5">
              {locale === "zh-TW" ? "已保存的賽事 AI 分析結果" : "Saved AI analysis results from past meetings"}
            </p>
          </div>
        </div>

        {loading && (
          <div className="flex items-center justify-center gap-3 py-20 text-white/50">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-[#28E88E]" />
            {locale === "zh-TW" ? "載入中…" : "Loading…"}
          </div>
        )}

        {!loading && error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-6 text-center text-red-400">
            {error}
          </div>
        )}

        {!loading && !error && meetings.length === 0 && (
          <div className="rounded-xl border border-white/10 bg-[#1a1a1a] p-12 text-center text-white/40">
            {locale === "zh-TW" ? "暫無已保存的賽事分析" : "No saved meeting analyses yet"}
          </div>
        )}

        {!loading && meetings.map((meeting) => {
          const venueLabel = VENUE_LABELS[meeting.venue_code] ?? { en: meeting.venue_code, zh: meeting.venue_code };
          const venue = locale === "zh-TW" ? venueLabel.zh : venueLabel.en;

          return (
            <section key={`${meeting.race_date}-${meeting.venue_code}`} className="space-y-4">
              {/* Meeting header */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="inline-flex items-center rounded-lg bg-[#28E88E]/10 border border-[#28E88E]/20 px-3 py-1 text-[13px] font-bold text-[#28E88E] tracking-wide">
                    {venue}
                  </span>
                  <h2 className="font-inter text-lg sm:text-xl font-semibold text-white">
                    {formatDate(meeting.race_date)}
                  </h2>
                </div>
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-sm text-white/40 shrink-0">
                  {meeting.analyses.length}{" "}
                  {locale === "zh-TW" ? "場" : meeting.analyses.length === 1 ? "race" : "races"}
                </span>
              </div>

              {/* Race cards grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {meeting.analyses.map((entry) => {
                  const aj = entry.analysis_json;
                  const top4 = aj.topPicks?.slice(0, 4) ?? [];
                  const riskStyle = RISK_STYLES[aj.riskLevel] ?? RISK_STYLES.MEDIUM;
                  const href = `/races/${entry.race_id}?date=${meeting.race_date}&venue=${meeting.venue_code}`;
                  const raceName = locale === "zh-TW"
                    ? entry.race_name_ch || entry.race_name_en || entry.race_id
                    : entry.race_name_en || entry.race_name_ch || entry.race_id;

                  return (
                    <Link
                      key={entry.race_id}
                      href={href}
                      className="group block rounded-xl border border-white/10 bg-[#1a1a1a] p-4 hover:border-white/20 hover:bg-[#1e1e1e] transition no-underline"
                    >
                      {/* Risk badge */}
                      <div className="flex items-center justify-between mb-2">
                        <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold ${riskStyle}`}>
                          {aj.riskLevel}
                        </span>
                      </div>

                      {/* Race name */}
                      <p className="text-[14px] font-semibold text-white leading-snug line-clamp-2 mb-3 min-h-[42px]">
                        {raceName}
                      </p>

                      {/* Overall win % */}
                      <div className="mb-3 flex items-baseline gap-1.5">
                        <span className="font-inter text-[26px] font-bold text-[#28E88E] leading-none">
                          {aj.overallWinPct}%
                        </span>
                        <span className="text-xs text-white/40">
                          {locale === "zh-TW" ? "最高勝率" : "top win chance"}
                        </span>
                      </div>

                      {/* Top picks */}
                      <div className="space-y-1.5">
                        {top4.map((pick, idx) => (
                          <div key={pick.no} className="flex items-center gap-2.5">
                            <span
                              className="shrink-0 inline-flex h-5 w-5 items-center justify-center rounded-md text-[10px] font-bold text-[#0d0d0d]"
                              style={{ background: RANK_COLORS[idx] ?? "#666" }}
                            >
                              {idx + 1}
                            </span>
                            <span className="min-w-[22px] inline-flex items-center justify-center rounded bg-white/10 text-[10px] font-bold text-white/70 px-1 py-0.5">
                              {pick.no}
                            </span>
                            <span className="flex-1 text-[13px] text-white/80 truncate group-hover:text-white transition">
                              {pick.name}
                            </span>
                            <span className="shrink-0 text-[13px] font-semibold text-[#28E88E]">
                              {pick.winPct}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* View link */}
                      <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-end gap-1 text-xs text-white/30 group-hover:text-[#28E88E] transition">
                        {locale === "zh-TW" ? "查看詳情" : "View details"}
                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          );
        })}

        {!loading && !error && hasMore && (
          <div className="flex justify-center pt-2">
            <button
              type="button"
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-5 py-2 text-sm font-medium text-white/80 transition hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loadingMore && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-[#28E88E]" />
              )}
              {locale === "zh-TW" ? "載入更多" : "Load more"}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
