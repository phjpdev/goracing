"use client";

import type { RacecardRow } from "@/types";
import { useLanguage } from "@/lib/context/LanguageContext";

const RANK_STYLES: Record<number, string> = {
  1: "bg-[#1a3328] border border-[#28E88E] text-white",
  2: "bg-[#1a3328] border border-[#28E88E] text-white",
  3: "bg-[#1a3328] border border-[#28E88E] text-white",
  4: "bg-[#1a1a1a] border border-[#fbbf24] text-white",
  5: "bg-[#1a1a1a] border border-[#fbbf24] text-white",
  6: "bg-[#1a1a1a] border border-[#fbbf24] text-white",
};

type SmartRacecardProps = {
  racecard: RacecardRow[];
};

export function SmartRacecard({ racecard }: SmartRacecardProps) {
  const { t } = useLanguage();

  return (
    <section className="rounded-xl sm:rounded-2xl border border-white/10 bg-[#1a1a1a] p-3 sm:p-5 lg:p-6 h-full overflow-hidden">
      <h2 className="font-inter text-base font-semibold text-white mb-3 sm:text-[22px] sm:mb-4">{t.races.smartRacecard}</h2>
      <div className="overflow-hidden">
        <table className="w-full font-inter text-xs sm:text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left text-white/70 align-middle">
              <th className="pb-2 pr-2 font-medium text-xs sm:pb-3 sm:pr-3 sm:text-[12.5px] w-[40px]">{t.races.rank}</th>
              <th className="pb-2 pr-2 font-medium text-xs sm:pb-3 sm:pr-3 sm:text-[12.5px]">{t.matches.horse}</th>
              <th className="pb-2 pr-2 font-medium text-xs sm:pb-3 sm:pr-3 sm:text-[12.5px]">{t.races.jockey}</th>
              <th className="pb-2 pr-2 font-medium text-xs sm:pb-3 sm:pr-3 sm:text-[12.5px] w-[50px]">{t.matches.speed}</th>
              <th className="pb-2 pr-2 font-medium text-xs sm:pb-3 sm:pr-3 sm:text-[12.5px] w-[45px]">{t.matches.class}</th>
              <th className="pb-2 pr-2 font-medium text-xs sm:pb-3 sm:pr-3 sm:text-[12.5px] w-[55px]">{t.races.winPct}</th>
              <th className="pb-2 font-medium text-xs sm:pb-3 sm:text-[12.5px] w-[80px]">{t.races.betStatus}</th>
            </tr>
          </thead>
          <tbody>
            {racecard.map((row) => (
              <tr key={row.rank} className="border-b border-white/5 hover:bg-white/5 transition-colors align-middle">
                <td className="align-middle py-2.5 pr-2 sm:py-3 sm:pr-3">
                  <span
                    className={`inline-flex min-w-[26px] h-7 items-center justify-center rounded-lg px-1.5 font-medium text-white sm:min-w-[28px] sm:h-8 sm:px-2 ${RANK_STYLES[row.rank] ?? "bg-[#1a1a1a] border border-white/20 text-white"}`}
                  >
                    {row.rank}
                  </span>
                </td>
                <td className="align-middle py-2.5 pr-2 sm:py-3 sm:pr-3">
                  <div className="min-w-0">
                    <p className="font-medium text-white">{row.horse}</p>
                    <p className="text-white/50 text-[10px] sm:text-xs mt-0.5 line-clamp-2">
                      {row.sire}
                    </p>
                  </div>
                </td>
                <td className="align-middle py-2.5 pr-2 sm:py-3 sm:pr-3">
                  <div className="min-w-0">
                    <p className="font-medium text-white whitespace-nowrap">{row.jockey}</p>
                    <p className="text-white/60 text-[10px] sm:text-xs mt-0.5 whitespace-nowrap">{row.trainer}</p>
                  </div>
                </td>
                <td className="align-middle py-2.5 pr-2 text-white sm:py-3 sm:pr-3">{row.speed}</td>
                <td className="align-middle py-2.5 pr-2 text-white sm:py-3 sm:pr-3">{row.class}</td>
                <td className="align-middle py-2.5 pr-2 font-medium text-[#28E88E] sm:py-3 sm:pr-3">{row.winPct}</td>
                <td className="align-middle py-2.5 sm:py-3">
                  <span
                    className={`inline-block rounded-lg px-2 py-1 text-[10px] font-medium sm:px-3 sm:py-1.5 sm:text-xs ${
                      row.betStatus === "Accepting"
                        ? "bg-[#28E88E]/20 text-[#28E88E] border border-[#28E88E]/40"
                        : "bg-red-500/20 text-red-400 border border-red-500/40"
                    }`}
                  >
                    {row.betStatus === "Accepting" ? t.races.accepting : t.races.closed}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
