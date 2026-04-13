"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/context/LanguageContext";
import { ROUTES } from "@/lib/constants";

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
  const { locale } = useLanguage();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/analyses/recent")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setMeetings(data);
        else setError("Failed to load");
      })
      .catch(() => setError("Failed to load"))
      .finally(() => setLoading(false));
  }, []);

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
              {locale === "zh-TW" ? "最近 3 場賽事的 AI 分析結果" : "AI analysis results from the last 3 meetings"}
            </p>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center gap-3 py-20 text-white/50">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-[#28E88E]" />
            {locale === "zh-TW" ? "載入中…" : "Loading…"}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-6 text-center text-red-400">
            {error}
          </div>
        )}

        {/* Empty */}
        {!loading && !error && meetings.length === 0 && (
          <div className="rounded-xl border border-white/10 bg-[#1a1a1a] p-12 text-center text-white/40">
            {locale === "zh-TW" ? "暫無已保存的賽事分析" : "No saved meeting analyses yet"}
          </div>
        )}

        {/* Meetings */}
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

                  return (
                    <Link
                      key={entry.race_id}
                      href={href}
                      className="group block rounded-xl border border-white/10 bg-[#1a1a1a] p-4 hover:border-white/20 hover:bg-[#1e1e1e] transition no-underline"
                    >
                      {/* Card top row */}
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs text-white/40 font-mono">
                          {entry.race_id.split("-").slice(-2).join("-")}
                        </span>
                        <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold ${riskStyle}`}>
                          {aj.riskLevel}
                        </span>
                      </div>

                      {/* Overall win % */}
                      <div className="mb-3 flex items-baseline gap-1.5">
                        <span className="font-inter text-[28px] font-bold text-[#28E88E] leading-none">
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

                      {/* View link indicator */}
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
      </main>
    </div>
  );
}
