import Link from "next/link";
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

export function MatchCard({ race, index, isSelected, onClick, meetingDate, venueCode }: MatchCardProps) {
  const { t } = useLanguage();
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
      <h3 className="font-inter text-sm font-bold text-white mb-3">
        {t.matches.match} {index}: {race.raceName_en || `Race ${race.no}`}
      </h3>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 font-inter text-xs">
        <dt className="text-white/50">{t.matches.frontRunnerBias}</dt>
        <dd className="text-right text-red-400 font-medium">{t.matches.detected}</dd>

        <dt className="text-white/50">{t.matches.class}</dt>
        <dd className="text-right text-white font-medium">
          {race.distance ? `${race.distance}` : "-"} {race.raceTrack?.description_en || "Turf"}
        </dd>

        <dt className="text-white/50">{t.matches.track}</dt>
        <dd className="text-right text-[#28E88E] font-medium">{race.go_en || "-"}</dd>

        <dt className="text-white/50">{t.matches.duration}</dt>
        <dd className="text-right text-white font-medium">{formatTime(race.postTime)}</dd>

        <dt className="text-white/50">{t.matches.winRate}</dt>
        <dd className="text-right">
          <Link
            href={`${ROUTES.RACE(race.id)}?date=${meetingDate}&venue=${venueCode}`}
            onClick={(e) => e.stopPropagation()}
            className="inline-block rounded-md border border-[#28E88E] px-3 py-1 text-[#28E88E] text-xs font-medium hover:bg-[#28E88E] hover:text-[#020308] transition-colors no-underline"
          >
            {t.matches.viewDetails}
          </Link>
        </dd>
      </dl>
    </div>
  );
}
