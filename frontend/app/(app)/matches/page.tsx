"use client";

import { useEffect, useState } from "react";
import { MatchCard, OddsTable } from "@/components/features/matches";
import { useAuth } from "@/lib/context/AuthContext";
import { useLanguage } from "@/lib/context/LanguageContext";
import type { HKJCMeeting, HKJCRace } from "@/types/race-meeting";

const VENUE_CODES = ["ST", "HV"] as const;

function todayHK() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Hong_Kong" });
}

export default function MatchesPage() {
  const { t } = useLanguage();
  const { auth } = useAuth();
  const isManager = auth?.role === "admin" || auth?.role === "subadmin";
  const [date, setDate] = useState(todayHK());
  const [venue, setVenue] = useState<(typeof VENUE_CODES)[number]>("ST");
  const [meeting, setMeeting] = useState<HKJCMeeting | null>(null);
  const [selectedRace, setSelectedRace] = useState<HKJCRace | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [upgradeMessage, setUpgradeMessage] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    setMeeting(null);
    setSelectedRace(null);
    setUpgradeMessage("");

    (async () => {
      try {
        for (const code of VENUE_CODES) {
          const r = await fetch(`/api/races/meetings?date=${date}&venue=${code}`, {
            signal: controller.signal,
          });
          const data = await r.json().catch(() => null);
          if (!r.ok) throw new Error(data?.error ?? "Failed to fetch race meetings");

          const meetings = (data as HKJCMeeting[]) ?? [];
          const m = meetings?.[0] ?? null;
          if (m && (m.races?.length ?? 0) > 0) {
            setVenue((m.venueCode as (typeof VENUE_CODES)[number]) ?? code);
            setMeeting(m);
            const firstAllowed =
              (m?.races ?? []).find((r) => !(r.isLocked && !isManager)) ?? null;
            setSelectedRace(firstAllowed);
            if (m?.date && m.date !== date) setDate(m.date);
            setLoading(false);
            return;
          }
        }
        setMeeting(null);
        setLoading(false);
      } catch (e: any) {
        if (e?.name !== "AbortError") {
          setError("Failed to load race data.");
          setLoading(false);
        }
      }
    })();

    return () => controller.abort();
  }, [date, isManager]);

  return (
    <div className="h-[calc(100vh-80px)] overflow-hidden bg-[#0d0d0d] text-white flex flex-col">
      {/* Controls */}
      <div className="shrink-0 mx-auto w-full max-w-[1600px] px-3 pt-4 pb-3 sm:px-6 sm:pt-6 sm:pb-4 lg:px-8">
        <div className="flex flex-wrap items-center gap-3">
          {meeting && (
            <span className="text-white/40 text-sm">
              {meeting.totalNumberOfRace} {t.matches.races} · {meeting.date}
            </span>
          )}
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 min-h-0 mx-auto w-full max-w-[1600px] px-3 pb-4 sm:px-6 lg:px-8">
        {upgradeMessage && (
          <div className="rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-amber-200 text-sm mb-3">
            {upgradeMessage}
          </div>
        )}
        {loading && (
          <div className="flex items-center gap-2 text-white/50 text-sm py-4">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-[#28E88E]" />
            {t.matches.loadingRaces}
          </div>
        )}
        {error && <p className="text-red-400 text-sm">{error}</p>}
        {!loading && !error && !meeting && (
          <p className="text-white/40 text-sm py-4">{t.matches.noMeeting}</p>
        )}

        {meeting && meeting.races.length > 0 && (
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 h-full">
            <div className="w-full lg:w-[280px] lg:min-w-[280px] flex flex-col gap-3 overflow-y-auto lg:pb-4 lg:pr-1 scrollbar-green">
              {meeting.races.map((race, i) => (
                <MatchCard
                  key={race.id}
                  race={race}
                  index={i + 1}
                  isSelected={selectedRace?.id === race.id}
                  onClick={() => {
                    if (race.isLocked && !isManager) {
                      setUpgradeMessage("請升級VVIP");
                      return;
                    }
                    setUpgradeMessage("");
                    setSelectedRace(race);
                  }}
                  meetingDate={meeting.date}
                  venueCode={meeting.venueCode}
                />
              ))}
            </div>

            <div className="hidden lg:block flex-1 min-w-0 overflow-y-auto scrollbar-green">
              <OddsTable runners={selectedRace?.runners ?? []} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
