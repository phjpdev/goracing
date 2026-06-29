"use client";

import { useEffect, useState } from "react";
import { MatchCard, OddsTable } from "@/components/features/matches";
import { LoginRequiredModal } from "@/components/ui/LoginRequiredModal";
import { VipPaywallModal } from "@/components/ui/VipPaywallModal";
import { readMeetingsClientCache, writeMeetingsClientCache } from "@/lib/meetings/clientCache";
import { useAuth } from "@/lib/context/AuthContext";
import { useLanguage } from "@/lib/context/LanguageContext";
import type { HKJCMeeting, HKJCRace } from "@/types/race-meeting";

const VENUE_CODES = ["ST", "HV"] as const;

function todayHK() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Hong_Kong" });
}

function applyMeeting(
  m: HKJCMeeting,
  isManager: boolean
): { venue: (typeof VENUE_CODES)[number]; meeting: HKJCMeeting; selectedRace: HKJCRace | null } {
  const code = (m.venueCode as (typeof VENUE_CODES)[number]) ?? "ST";
  const firstAllowed = (m.races ?? []).find((r) => !(r.isLocked && !isManager)) ?? null;
  return { venue: code, meeting: m, selectedRace: firstAllowed };
}

export default function MatchesPage() {
  const { t, locale } = useLanguage();
  const { auth } = useAuth();
  const isLoggedIn = auth?.authenticated === true;
  const isManager = auth?.role === "admin" || auth?.role === "subadmin";
  const isVip = !!auth?.vip_expiry_date && new Date(auth.vip_expiry_date).getTime() > Date.now();
  const [date, setDate] = useState(todayHK());
  const [venue, setVenue] = useState<(typeof VENUE_CODES)[number]>("ST");
  const [meeting, setMeeting] = useState<HKJCMeeting | null>(null);
  const [selectedRace, setSelectedRace] = useState<HKJCRace | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [upgradeMessage, setUpgradeMessage] = useState("");
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  useEffect(() => {
    const cached = readMeetingsClientCache();
    if (cached && (cached.races?.length ?? 0) > 0) {
      const applied = applyMeeting(cached, isManager);
      setVenue(applied.venue);
      setMeeting(applied.meeting);
      setSelectedRace(applied.selectedRace);
      setLoading(false);
      setRefreshing(true);
    } else {
      setLoading(true);
      setMeeting(null);
      setSelectedRace(null);
    }

    setError("");
    setUpgradeMessage("");

    const controller = new AbortController();

    fetch(`/api/races/meetings?date=${date}&venue=auto&list=1`, { signal: controller.signal })
      .then(async (r) => {
        const data = await r.json().catch(() => null);
        if (!r.ok) throw new Error(data?.error ?? "Failed to fetch race meetings");
        return data as HKJCMeeting[];
      })
      .then((meetings) => {
        const m = meetings?.[0] ?? null;
        if (!m || (m.races?.length ?? 0) === 0) {
          setMeeting(null);
          setSelectedRace(null);
          setLoading(false);
          setRefreshing(false);
          return;
        }

        writeMeetingsClientCache(m);
        const applied = applyMeeting(m, isManager);
        setVenue(applied.venue);
        setMeeting(applied.meeting);
        setSelectedRace(applied.selectedRace);
        if (m.date && m.date !== date) setDate(m.date);
        setLoading(false);
        setRefreshing(false);

        // Load full runner/odds data in background (desktop odds table)
        const fullUrl = `/api/races/meetings?date=${m.date}&venue=${m.venueCode}`;
        fetch(fullUrl, { signal: controller.signal })
          .then((r) => (r.ok ? r.json() : null))
          .then((fullMeetings: HKJCMeeting[] | null) => {
            const full = fullMeetings?.[0];
            if (!full) return;
            writeMeetingsClientCache(full);
            const next = applyMeeting(full, isManager);
            setMeeting(next.meeting);
            setSelectedRace((prev) => {
              if (!prev) return next.selectedRace;
              return full.races?.find((r) => r.id === prev.id) ?? next.selectedRace;
            });
          })
          .catch(() => {});
      })
      .catch((e) => {
        if (e?.name !== "AbortError") {
          if (!cached) setError("Failed to load race data.");
          setLoading(false);
          setRefreshing(false);
        }
      });

    return () => controller.abort();
  }, [date, isManager]);

  return (
    <div className="h-full min-h-0 overflow-hidden bg-[#0d0d0d] text-white flex flex-col">
      <LoginRequiredModal open={loginModalOpen} onClose={() => setLoginModalOpen(false)} />
      <VipPaywallModal open={paywallOpen} onClose={() => setPaywallOpen(false)} />
      <div className="shrink-0 mx-auto w-full max-w-[1600px] px-3 pt-4 pb-3 sm:px-6 sm:pt-6 sm:pb-4 lg:px-8">
        <div className="flex flex-wrap items-center gap-3">
          {meeting && (
            <span className="text-white/40 text-sm">
              {(() => {
                const code = (meeting.venueCode as (typeof VENUE_CODES)[number]) ?? venue;
                const venueLabel =
                  locale === "zh-TW"
                    ? code === "HV"
                      ? "跑馬地"
                      : "沙田"
                    : code === "HV"
                      ? "Happy Valley"
                      : "Sha Tin";
                return `${venueLabel} · ${meeting.totalNumberOfRace} ${t.matches.races} · ${meeting.date}`;
              })()}
            </span>
          )}
          {refreshing && (
            <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/20 border-t-[#28E88E]" />
          )}
        </div>
      </div>

      <div className="flex-1 min-h-0 mx-auto w-full max-w-[1600px] px-3 pb-2 sm:px-6 sm:pb-4 lg:px-8">
        {upgradeMessage && (
          <div className="rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-amber-200 text-sm mb-3">
            {upgradeMessage}
          </div>
        )}
        {loading && !meeting && (
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
              {meeting.races.map((race, i) => {
                const shouldBlockVip = isLoggedIn && !isManager && !isVip;
                const shouldBlockLockedRace = race.isLocked && !isManager;

                const handleViewDetails = () => {
                  if (!isLoggedIn) {
                    setLoginModalOpen(true);
                    return;
                  }
                  if (shouldBlockVip) {
                    setPaywallOpen(true);
                    return;
                  }
                  if (shouldBlockLockedRace) {
                    setUpgradeMessage("請升級VVIP");
                  }
                };

                return (
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
                    onViewDetails={
                      !isLoggedIn || shouldBlockVip || shouldBlockLockedRace
                        ? handleViewDetails
                        : undefined
                    }
                    meetingDate={meeting.date}
                    venueCode={meeting.venueCode}
                  />
                );
              })}
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
