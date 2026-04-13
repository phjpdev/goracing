"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/lib/context/LanguageContext";
import type { HKJCMeeting } from "@/types/race-meeting";

type MeetingEntry = HKJCMeeting & { fetchedDate: string };

const VENUE_LABELS: Record<string, { en: string; zh: string }> = {
  ST: { en: "Sha Tin", zh: "沙田" },
  HV: { en: "Happy Valley", zh: "跑馬地" },
};

const STATUS_STYLES: Record<string, string> = {
  RESULTED: "text-white/40",
  GOING: "text-[#28E88E]",
  UPCOMING: "text-amber-400",
};

async function fetchMeeting(date: string, venue: string): Promise<HKJCMeeting | null> {
  try {
    const res = await fetch(`/api/races/meetings?date=${date}&venue=${venue}`);
    if (!res.ok) return null;
    const data: HKJCMeeting[] = await res.json();
    const m = data?.[0];
    return m?.races?.length ? m : null;
  } catch {
    return null;
  }
}

export function LastMatchesDropdown() {
  const { locale } = useLanguage();
  const [open, setOpen] = useState(false);
  const [meetings, setMeetings] = useState<MeetingEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const loaded = useRef(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function loadMeetings() {
    if (loaded.current) return;
    loaded.current = true;
    setLoading(true);

    const found: MeetingEntry[] = [];
    const today = new Date();

    for (let i = 1; i <= 21 && found.length < 3; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString("en-CA", { timeZone: "Asia/Hong_Kong" });

      const [st, hv] = await Promise.all([
        fetchMeeting(dateStr, "ST"),
        fetchMeeting(dateStr, "HV"),
      ]);

      for (const m of [st, hv]) {
        if (m && found.length < 3) {
          found.push({ ...m, fetchedDate: dateStr });
        }
      }
    }

    setMeetings(found);
    setLoading(false);
  }

  function handleToggle() {
    setOpen((o) => !o);
    if (!open) loadMeetings();
  }

  const label = locale === "zh-TW" ? "最近賽事" : "Last Matches";

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={handleToggle}
        className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-4 py-1.5 text-sm font-medium text-white/80 hover:bg-white/5 hover:text-white transition"
      >
        <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {label}
        <svg
          className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-[340px] sm:w-[400px] max-h-[70vh] overflow-y-auto rounded-xl border border-white/10 bg-[#0D1117] shadow-2xl z-50">
          <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
            <span className="text-sm font-semibold text-white">{label}</span>
            <span className="text-xs text-white/40">
              {locale === "zh-TW" ? "最近 3 場賽事" : "Last 3 meetings"}
            </span>
          </div>

          {loading && (
            <div className="flex items-center justify-center gap-2 py-10 text-white/50 text-sm">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-[#28E88E]" />
              {locale === "zh-TW" ? "載入中…" : "Loading…"}
            </div>
          )}

          {!loading && meetings.length === 0 && (
            <p className="py-8 text-center text-sm text-white/40">
              {locale === "zh-TW" ? "找不到近期賽事" : "No recent meetings found"}
            </p>
          )}

          {!loading && meetings.map((meeting, mi) => {
            const venueLabel = VENUE_LABELS[meeting.venueCode] ?? { en: meeting.venueCode, zh: meeting.venueCode };
            const venue = locale === "zh-TW" ? venueLabel.zh : venueLabel.en;
            const dateObj = new Date(meeting.fetchedDate);
            const dateLabel = dateObj.toLocaleDateString(
              locale === "zh-TW" ? "zh-HK" : "en-HK",
              { month: "short", day: "numeric", weekday: "short" }
            );
            const resulted = meeting.races.filter((r) => r.status === "RESULTED").length;

            return (
              <div key={`${meeting.fetchedDate}-${meeting.venueCode}`} className={mi > 0 ? "border-t border-white/10" : ""}>
                {/* Meeting header */}
                <div className="flex items-center justify-between px-4 py-2.5 bg-white/[0.03]">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-white/40 uppercase tracking-wider">{venue}</span>
                    <span className="text-[11px] text-white/30">·</span>
                    <span className="text-[11px] text-white/60">{dateLabel}</span>
                  </div>
                  <span className="text-[11px] text-white/40">
                    {resulted}/{meeting.races.length}{" "}
                    {locale === "zh-TW" ? "場完結" : "resulted"}
                  </span>
                </div>

                {/* Race list */}
                <div className="divide-y divide-white/5">
                  {meeting.races.map((race) => {
                    const raceName = locale === "zh-TW"
                      ? race.raceName_ch || race.raceName_en
                      : race.raceName_en || race.raceName_ch;
                    const statusStyle = STATUS_STYLES[race.status] ?? "text-white/40";
                    const statusLabel =
                      race.status === "RESULTED"
                        ? locale === "zh-TW" ? "完結" : "Done"
                        : race.status === "GOING"
                        ? locale === "zh-TW" ? "進行中" : "Live"
                        : locale === "zh-TW" ? "待賽" : "Soon";

                    const href = `/races/${race.id}?date=${meeting.fetchedDate}&venue=${meeting.venueCode}`;
                    const top = race.runners?.[0];
                    const topName = top
                      ? (locale === "zh-TW" ? top.name_ch || top.name_en : top.name_en || top.name_ch)
                      : null;

                    return (
                      <Link
                        key={race.id}
                        href={href}
                        onClick={() => setOpen(false)}
                        className="flex items-center justify-between px-4 py-2.5 hover:bg-white/5 transition no-underline group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="shrink-0 inline-flex h-6 w-6 items-center justify-center rounded-md bg-white/8 text-[11px] font-bold text-white/60 group-hover:text-white transition">
                            {race.no}
                          </span>
                          <div className="min-w-0">
                            <p className="text-[13px] font-medium text-white/80 group-hover:text-white leading-tight truncate transition">
                              {raceName}
                            </p>
                            {topName && race.status === "RESULTED" && (
                              <p className="text-[11px] text-white/40 mt-0.5 truncate">
                                🏆 {top?.no} {topName}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="shrink-0 flex items-center gap-2 ml-3">
                          <span className={`text-[11px] font-medium ${statusStyle}`}>{statusLabel}</span>
                          <svg className="h-3.5 w-3.5 text-white/20 group-hover:text-white/50 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
