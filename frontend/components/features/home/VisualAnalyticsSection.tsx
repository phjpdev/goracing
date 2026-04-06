"use client";

import { useLanguage } from "@/lib/context/LanguageContext";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { loadLastLandingAnalytics, type LastLandingAnalytics } from "@/lib/lastLandingAnalytics";
import { AIWinDonutChart, MarketActivityChart, PedigreeRadarChart } from "@/components/charts";

const ANALYTICS_CARD_CLASS =
  "overflow-hidden rounded-[16px] border border-white/[0.08] bg-white/[0.03] transition-all duration-300 hover:border-white/[0.15] hover:bg-white/[0.06]";

export function VisualAnalyticsSection() {
  const { t, locale } = useLanguage();
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
  const radarLabels = locale === "zh-TW"
    ? ["場地", "速度", "級別", "途程", "近況"]
    : ["Surface", "Speed", "Class", "Distance", "Form"];
  const winPct = saved?.charts.overallWinPct ?? 25;
  const donutSegments = saved?.charts.donutSegments?.length ? saved.charts.donutSegments : [20, 15, 12, 10];
  const marketPoints = saved?.charts.marketPoints?.length ? saved.charts.marketPoints : undefined;

  const items: { id: "radar" | "donut" | "market"; title: string; description: string; graphic: ReactNode }[] = [
    {
      id: "donut",
      title: t.races.aiWinProbability,
      description: t.races.winChance,
      graphic: (
        <div className="w-full max-w-[238px] aspect-square p-2 sm:max-w-[288px] sm:p-3">
          <AIWinDonutChart winPct={winPct} otherSegments={donutSegments} />
        </div>
      ),
    },
    {
      id: "radar",
      title: t.races.pedigreeAnalysis,
      description: t.visualAnalytics.pedigreeDesc,
      graphic: (
        <div className="w-full max-w-[228px] aspect-square p-2 sm:max-w-[268px] sm:p-3">
          <PedigreeRadarChart values={pedigreeValues} labels={radarLabels} />
        </div>
      ),
    },
    {
      id: "market",
      title: t.races.marketActivity,
      description: t.visualAnalytics.marketActivityDesc,
      graphic: (
        <div className="flex w-full flex-col items-center justify-center">
          <div className="w-full max-w-[268px] p-1.5 sm:max-w-[288px] sm:p-2">
            <MarketActivityChart points={marketPoints} />
          </div>
          <div className="mt-2 sm:mt-3 flex flex-wrap justify-center gap-3 sm:gap-6 font-inter text-[11px] text-white/80">
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
          <article key={item.id} className={`${ANALYTICS_CARD_CLASS} flex flex-col`}>
            <div className="relative h-[232px] sm:h-[272px] w-full">
              <div
                key={`${item.id}-${replayToken}`}
                className="absolute inset-0 flex items-center justify-center px-5 pt-6 pb-5 sm:px-6 sm:pt-7 sm:pb-6 lg:px-7 lg:pt-8 lg:pb-7"
              >
                {item.graphic}
              </div>
            </div>
            <div className="px-5 pb-5 sm:px-6 sm:pb-6 lg:px-7 lg:pb-7">
              <h3 className="text-[18px] font-semibold leading-[1.3] text-white">{item.title}</h3>
              <p className="mt-2 font-inter text-[14px] leading-[1.6] text-white/50">{item.description}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
