import Link from "next/link";
import type { MouseEvent } from "react";
import type { HKJCRace } from "@/types/race-meeting";
import { ROUTES } from "@/lib/constants";
import { useLanguage } from "@/lib/context/LanguageContext";

type MatchCardProps = {
  race: HKJCRace;
  index: number;
  isSelected: boolean;
  onClick: () => void;
  meetingDate: string;
  venueCode: string;
  onViewDetails?: () => void;
};

function formatTime(isoString: string) {
  if (!isoString) return "-";
  return new Date(isoString).toLocaleTimeString("en-HK", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Hong_Kong",
  });
}

export function MatchCard({ race, index, isSelected, onClick, meetingDate, venueCode, onViewDetails }: MatchCardProps) {
  const { t, locale } = useLanguage();
  const isZh = locale === "zh-TW";
  const raceName = (isZh ? race.raceName_ch || race.raceName_en : race.raceName_en || race.raceName_ch) || `Race ${race.no}`;
  const track = isZh ? race.raceTrack?.description_ch || race.raceTrack?.description_en : race.raceTrack?.description_en || race.raceTrack?.description_ch;
  const going = (isZh ? race.go_ch || race.go_en : race.go_en || race.go_ch) || "-";
  const raceClass = (isZh ? race.raceClass_ch || race.raceClass_en : race.raceClass_en || race.raceClass_ch) || "-";

  const handleViewDetailsClick = (e: MouseEvent<HTMLAnchorElement>) => {
    e.stopPropagation();
    if (!onViewDetails) return;
    e.preventDefault();
    onViewDetails();
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === "Enter") onClick(); }}
      className={`w-full text-left rounded-xl border-l-4 p-4 transition-all cursor-pointer ${
        isSelected
          ? "border-l-[#28E88E] shadow-[0px_34px_74px_0px_#00000052]"
          : "border-l-[#2a2a2a] bg-[#141414] hover:bg-[#1a1a1a]"
      }`}
      style={isSelected ? { background: "linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.12) 100%)" } : undefined}
    >
      <h3 className="font-inter text-sm font-bold text-white mb-3 flex items-center gap-2">
        <span className="min-w-0 truncate">
          {t.matches.match} {index}: {raceName}
        </span>
        {race.isLocked && (
          <svg
            aria-label="VVIP"
            className="h-4 w-4 shrink-0 text-amber-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.176 0l-2.8 2.034c-.784.57-1.838-.197-1.54-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.4 8.72c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z" />
          </svg>
        )}
      </h3>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 font-inter text-xs">
        <dt className="text-white/50">{t.matches.frontRunnerBias}</dt>
        <dd className="text-right text-red-400 font-medium">{t.matches.detected}</dd>

        <dt className="text-white/50">{t.matches.class}</dt>
        <dd className="text-right text-white font-medium">
          {raceClass}
        </dd>

        <dt className="text-white/50">{t.matches.track}</dt>
        <dd className="text-right text-[#28E88E] font-medium">{going}</dd>

        <dt className="text-white/50">{t.matches.duration}</dt>
        <dd className="text-right text-white font-medium">{formatTime(race.postTime)}</dd>

        <dt className="text-white/50">{t.matches.horse}</dt>
        <dd className="text-right text-white/80 font-medium">
          {race.distance ? `${race.distance}m` : "-"} {track || (isZh ? "草地" : "Turf")}
        </dd>

        <dt className="text-white/50">{t.matches.winRate}</dt>
        <dd className="text-right">
          <Link
            href={`${ROUTES.RACE(race.id)}?date=${meetingDate}&venue=${venueCode}`}
            onClick={handleViewDetailsClick}
            className="inline-block rounded-md border border-[#28E88E] px-3 py-1 text-[#28E88E] text-xs font-medium hover:bg-[#28E88E] hover:text-[#020308] transition-colors no-underline"
          >
            {t.matches.viewDetails}
          </Link>
        </dd>
      </dl>
    </div>
  );
}
