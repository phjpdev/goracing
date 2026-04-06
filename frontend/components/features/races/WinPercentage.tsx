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
  1: "1",
  2: "2",
  3: "3",
  4: "4",
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
      <style>{`
        @keyframes track-breathe {
          0%, 100% {
            filter: brightness(1) drop-shadow(0 0 8px rgba(80,160,255,0.3));
            opacity: 0.9;
          }
          50% {
            filter: brightness(1.3) drop-shadow(0 0 24px rgba(80,180,255,0.6)) drop-shadow(0 0 48px rgba(60,140,255,0.25));
            opacity: 1;
          }
        }
        @keyframes card-slide-in {
          0% {
            opacity: 0;
            transform: translateX(-30px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
      <div className="flex items-center justify-between gap-3 mb-4">
        <h2 className="font-inter text-base font-semibold text-white sm:text-[22px]">
          {t.races.winPercentage}
        </h2>
      </div>

      <div className="relative flex items-center gap-0">
        {/* Track visual */}
        <div
          className="relative -ml-4 sm:-ml-5 lg:-ml-6 shrink-0 w-[200px] sm:w-[230px] lg:w-[220px]"
          style={{ animation: "track-breathe 3s ease-in-out infinite" }}
        >
          <Image
            src={RACE_VECTOR}
            alt="Race track"
            width={320}
            height={580}
            className="w-full h-auto"
          />
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
        <div
          className="
            absolute top-0 bottom-0 right-0 left-[136px] max-[420px]:left-[120px]
            flex flex-col justify-center gap-2 sm:gap-3
            sm:static sm:left-auto sm:right-auto sm:top-auto sm:bottom-auto sm:justify-start sm:flex-1 sm:min-w-0
          "
        >
          {top4.map((row, idx) => (
            <div
              key={row.rank}
              className={`rounded-lg sm:rounded-xl bg-[#1e1e1e] p-2.5 sm:p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] border border-white/5 min-w-0 ${HORSE_BOX_OFFSET[idx + 1] ?? ""}`}
              style={{
                animation: `card-slide-in 0.5s ease-out ${idx * 0.25}s both`,
              }}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className={`inline-flex h-6 sm:h-7 min-w-[28px] shrink-0 items-center justify-center rounded-lg px-2 font-inter text-[11px] sm:text-xs font-bold ${POSITION_STYLES[idx + 1]}`}
                >
                  {POSITION_LABELS[idx + 1]}
                </span>
                <div className="min-w-0 flex-1">
                  <span className="block font-inter font-semibold text-[12px] sm:text-sm text-white leading-snug">
                    <span className="flex items-start gap-2 min-w-0">
                      <span className="inline-flex h-5 min-w-[26px] items-center justify-center rounded-md bg-white/10 text-white/90 text-[10px] font-bold">
                        {row.horseNo}
                      </span>
                      <span className="min-w-0 whitespace-normal break-normal line-clamp-2 leading-tight">
                        {row.horse}
                      </span>
                    </span>
                  </span>
                  <div className="mt-1 flex items-center justify-between gap-3">
                    <span className="font-inter text-[10px] sm:text-[11px] text-white/50 leading-tight whitespace-nowrap">
                      {t.races.goldHighlight}
                    </span>
                    <span className="shrink-0 font-inter font-semibold text-[13px] sm:text-sm text-[#28E88E] leading-tight">
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
