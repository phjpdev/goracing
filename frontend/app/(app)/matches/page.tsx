"use client";

import { useEffect, useState } from "react";
import { MatchCard, OddsTable } from "@/components/features/matches";
import { useLanguage } from "@/lib/context/LanguageContext";
import type { HKJCMeeting, HKJCRace } from "@/types/race-meeting";

const VENUES = [
  { code: "ST", label: "Sha Tin" },
  { code: "HV", label: "Happy Valley" },
];

function todayHK() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Hong_Kong" });
}

export default function MatchesPage() {
  const { t } = useLanguage();
  const [date, setDate] = useState(todayHK());
  const [venue, setVenue] = useState("ST");
  const [meeting, setMeeting] = useState<HKJCMeeting | null>(null);
  const [selectedRace, setSelectedRace] = useState<HKJCRace | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    setMeeting(null);
    setSelectedRace(null);

    fetch(`/api/races/meetings?date=${date}&venue=${venue}`, { signal: controller.signal })
      .then((r) => r.json())
      .then((data: HKJCMeeting[]) => {
        const m = data?.[0] ?? null;
        setMeeting(m);
        setSelectedRace(m?.races?.[0] ?? null);
        if (m?.date && m.date !== date) setDate(m.date);
        setLoading(false);
      })
      .catch((e) => {
        if (e.name !== "AbortError") {
          setError("Failed to load race data.");
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [date, venue]);

  return (
    <div className="h-[calc(100vh-80px)] overflow-hidden bg-[#0d0d0d] text-white flex flex-col">
      {/* Controls */}
      <div className="shrink-0 mx-auto w-full max-w-[1600px] px-3 pt-4 pb-3 sm:px-6 sm:pt-6 sm:pb-4 lg:px-8">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex gap-2">
            {VENUES.map((v) => (
              <button
                key={v.code}
                type="button"
                onClick={() => setVenue(v.code)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  venue === v.code
                    ? "bg-[#28E88E] text-[#020308]"
                    : "bg-[#1a1a1a] border border-white/10 text-white/70 hover:text-white"
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>
          {meeting && (
            <span className="text-white/40 text-sm">
              {meeting.totalNumberOfRace} {t.matches.races} · {meeting.date}
            </span>
          )}
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 min-h-0 mx-auto w-full max-w-[1600px] px-3 pb-4 sm:px-6 lg:px-8">
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
                  onClick={() => setSelectedRace(race)}
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
