"use client";

import { AIWinDonutChart } from "@/components/charts";
import { useLanguage } from "@/lib/context/LanguageContext";

type AiWinProbabilityCardProps = {
  winPct: number;
  donutSegments: number[];
  className?: string;
};

export function AiWinProbabilityCard({ winPct, donutSegments, className = "" }: AiWinProbabilityCardProps) {
  const { t } = useLanguage();

  return (
    <article className={`rounded-xl sm:rounded-2xl border border-white/10 bg-[#1a1a1a] p-4 sm:p-5 lg:p-6 ${className}`}>
      <h3 className="font-inter text-[22px] font-semibold text-white mb-4 sm:mb-6">{t.races.aiWinProbability}</h3>
      <div className="flex items-center justify-center h-[200px] w-full max-w-[280px] sm:h-[300px] sm:max-w-[340px] overflow-hidden mx-auto">
        <AIWinDonutChart winPct={winPct} otherSegments={donutSegments} />
      </div>
    </article>
  );
}
