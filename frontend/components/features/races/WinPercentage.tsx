"use client";

import Image from "next/image";
import type { RacecardRow } from "@/types";
import { useLanguage } from "@/lib/context/LanguageContext";

const RACE_VECTOR = "/assets/race-vector.png";
const RACE_BAR1 = "/assets/Vector-1.png";
const RACE_BAR2 = "/assets/Vector-2.png";
const RACE_BAR3 = "/assets/Vector-3.png";
const RACE_BAR4 = "/assets/Vector-4.png";

const POSITION_STYLES: Record<number, string> = {
  1: "bg-[#F7A83B] text-white",
  2: "bg-[#28E88E] text-white",
  3: "bg-[#3B82F6] text-white",
  4: "bg-[#8B5CF6] text-white",
};

const POSITION_LABELS: Record<number, string> = {
  1: "1st",
  2: "2nd",
  3: "3rd",
  4: "4th",
};

const HORSE_BOX_OFFSET: Record<number, string> = {
  1: "lg:-ml-16",
  2: "lg:-ml-10",
  3: "lg:-ml-6",
  4: "lg:-ml-16",
};

type WinPercentageProps = {
  racecard: RacecardRow[];
};

export function WinPercentage({ racecard }: WinPercentageProps) {
  const { t } = useLanguage();
  const top4 = racecard.slice(0, 4);

  return (
    <article className="rounded-xl sm:rounded-2xl border border-white/10 bg-[#1a1a1a] p-4 sm:p-5 lg:p-6 h-full">
      <h2 className="font-inter text-base font-semibold text-white mb-4 sm:text-[22px]">
        {t.races.winPercentage}
      </h2>

      <div className="relative grid grid-cols-[120px_1fr] lg:grid-cols-2 gap-0 items-center">
        {/* Track visual */}
        <div className="relative">
          <Image src={RACE_VECTOR} alt="Race track" width={220} height={400} className="w-full max-w-[120px] lg:max-w-[220px]" />
          <div className="absolute top-[16%] left-[24%] hidden xl:block pointer-events-none">
            <Image src={RACE_BAR1} alt="" width={60} height={16} className="object-contain" />
          </div>
          <div className="absolute top-[34%] left-[56%] hidden xl:block pointer-events-none">
            <Image src={RACE_BAR2} alt="" width={24} height={16} className="object-contain" />
          </div>
          <div className="absolute top-[58%] left-[66%] hidden xl:block pointer-events-none">
            <Image src={RACE_BAR3} alt="" width={24} height={16} className="object-contain" />
          </div>
          <div className="absolute top-[78%] left-[46%] hidden xl:block pointer-events-none">
            <Image src={RACE_BAR4} alt="" width={24} height={16} className="object-contain" />
          </div>
        </div>

        {/* Horse cards */}
        <div className="flex flex-col gap-2 sm:gap-3 min-w-0">
          {top4.map((row, idx) => (
            <div
              key={row.rank}
              className={`rounded-lg sm:rounded-xl bg-[#1e1e1e] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] border border-white/5 min-w-0 ${HORSE_BOX_OFFSET[idx + 1] ?? ""}`}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className={`inline-flex h-7 min-w-[28px] shrink-0 items-center justify-center rounded-lg px-2 font-inter text-xs font-bold ${POSITION_STYLES[idx + 1]}`}
                >
                  {POSITION_LABELS[idx + 1]}
                </span>
                <div className="min-w-0 flex-1">
                  <span className="font-inter font-semibold text-sm text-white whitespace-nowrap block">
                    {row.horse}
                  </span>
                  <div className="flex items-center justify-between">
                    <span className="font-inter text-[11px] text-white/50">
                      {t.races.goldHighlight}
                    </span>
                    <span className="font-inter font-semibold text-sm text-[#28E88E]">
                      {row.winPct}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}
