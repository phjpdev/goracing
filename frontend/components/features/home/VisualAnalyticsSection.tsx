"use client";

import { useLanguage } from "@/lib/context/LanguageContext";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { loadLastLandingAnalytics, type LastLandingAnalytics } from "@/lib/lastLandingAnalytics";
import { AIWinDonutChart, MarketActivityChart, PedigreeRadarChart } from "@/components/charts";

const ANALYTICS_CARD_CLASS =
  "overflow-hidden rounded-[16px] border border-white/[0.08] bg-white/[0.03] transition-all duration-300 hover:border-white/[0.15] hover:bg-white/[0.06]";

export function VisualAnalyticsSection() {
  const { t } = useLanguage();
  const sectionRef = useRef<HTMLElement | null>(null);
  const [saved, setSaved] = useState<LastLandingAnalytics | null>(null);
  const [replayToken, setReplayToken] = useState(0);
  const wasInViewRef = useRef(false);

  useEffect(() => {
    setSaved(loadLastLandingAnalytics());
  }, []);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const inView = Boolean(entry?.isIntersecting);
        const wasInView = wasInViewRef.current;
        wasInViewRef.current = inView;

        // Trigger only on "enter" (false -> true), so scrolling within the section doesn't spam replays.
        if (inView && !wasInView) {
          setReplayToken((t) => t + 1);
        }
      },
      {
        threshold: 0.35,
        rootMargin: "0px 0px -10% 0px",
      },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const pedigreeValues = saved?.charts.pedigreeValues?.length ? saved.charts.pedigreeValues : [78, 84, 66, 72, 58];
  const radarLabels = saved?.charts.radarLabels?.length ? saved.charts.radarLabels : ["Surface", "Speed", "Class", "Distance", "Form"];
  const winPct = saved?.charts.overallWinPct ?? 25;
  const donutSegments = saved?.charts.donutSegments?.length ? saved.charts.donutSegments : [20, 15, 12, 10];
  const marketPoints = saved?.charts.marketPoints?.length ? saved.charts.marketPoints : undefined;

  const items: { title: string; description: string; graphic: ReactNode }[] = [
    {
      title: t.races.pedigreeAnalysis,
      description: t.visualAnalytics.pedigreeDesc,
      graphic: (
        <div key={`radar-${replayToken}`} className="flex h-full w-full items-center justify-center p-4">
          <div className="w-full max-w-[260px] aspect-square sm:max-w-[300px]">
            <PedigreeRadarChart values={pedigreeValues} labels={radarLabels} />
          </div>
        </div>
      ),
    },
    {
      title: t.races.aiWinProbability,
      description: t.races.winChance,
      graphic: (
        <div key={`donut-${replayToken}`} className="flex h-full w-full items-center justify-center p-4">
          <div className="w-full max-w-[280px] aspect-square sm:max-w-[320px]">
            <AIWinDonutChart winPct={winPct} otherSegments={donutSegments} />
          </div>
        </div>
      ),
    },
    {
      title: t.races.marketActivity,
      description: t.visualAnalytics.marketActivityDesc,
      graphic: (
        <div key={`market-${replayToken}`} className="flex h-full w-full flex-col items-center justify-center p-4">
          <div className="w-full max-w-[320px]">
            <MarketActivityChart points={marketPoints} />
          </div>
          <div className="mt-3 flex flex-wrap justify-center gap-3 font-inter text-[11px] text-white/80">
            <span className="inline-flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#28E88E]" />
              {t.races.oddsDropping}
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
              {t.races.oddsDrifting}
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-white/60" />
              {t.races.stable}
            </span>
          </div>
        </div>
      ),
    },
  ];

  return (
    <section ref={sectionRef} className="mx-auto mt-16 sm:mt-24 lg:mt-32 w-full max-w-[1360px] px-5 sm:px-6 lg:px-10">
      <div className="text-center">
        <h2 className="text-[28px] sm:text-[34px] lg:text-[40px] font-semibold leading-[1.2] tracking-[-0.01em] text-white">
          {t.visualAnalytics.title}
        </h2>
        <p className="mx-auto mt-4 max-w-[560px] font-inter text-[15px] sm:text-[16px] font-light leading-[1.6] text-white/50">
          {t.visualAnalytics.subtitle}
        </p>
      </div>
      <div className="mt-10 sm:mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {items.map((item) => (
          <article key={item.title} className={ANALYTICS_CARD_CLASS}>
            <div className="relative h-[220px] sm:h-[260px] w-full">
              {item.graphic}
            </div>
            <div className="p-5 lg:p-6">
              <h3 className="text-[18px] font-semibold leading-[1.3] text-white">{item.title}</h3>
              <p className="mt-2 font-inter text-[14px] leading-[1.6] text-white/50">{item.description}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
