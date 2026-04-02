"use client";

import Image from "next/image";
import { useLanguage } from "@/lib/context/LanguageContext";

const FEATURE_CARD_CLASS =
  "group flex h-auto flex-col rounded-[16px] border border-white/[0.08] bg-white/[0.03] p-6 lg:p-7 transition-all duration-300 hover:border-white/[0.15] hover:bg-white/[0.06]";

const FEATURE_ICONS = [
  "/assets/Frame 2147224662.png",
  "/assets/id-card.png",
  "/assets/zap.png",
  "/assets/eye.png",
];

export function FeatureCards() {
  const { t } = useLanguage();

  const features = [
    { icon: FEATURE_ICONS[0], title: t.features.aiIntelligence, description: t.features.aiIntelligenceDesc },
    { icon: FEATURE_ICONS[1], title: t.features.smartRacecard, description: t.features.smartRacecardDesc },
    { icon: FEATURE_ICONS[2], title: t.features.liveOdds, description: t.features.liveOddsDesc },
    { icon: FEATURE_ICONS[3], title: t.features.insights, description: t.features.insightsDesc },
  ];

  return (
    <section className="mt-10 sm:mt-16 lg:mt-24 w-full max-w-[1360px] mx-auto px-5 sm:px-6 lg:px-10">
      <style>{`
        @keyframes icon-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.2; }
        }
      `}</style>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-5">
        {features.map((feature) => (
          <article key={feature.title} className={FEATURE_CARD_CLASS}>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/[0.06] mb-5" style={{ animation: "icon-blink 2s ease-in-out infinite" }}>
              <Image src={feature.icon} alt="" width={54} height={44} className="h-8 w-auto" />
            </div>
            <h2 className="text-[18px] sm:text-[20px] font-semibold leading-[1.3] text-white">
              {feature.title}
            </h2>
            <p className="mt-2 text-[14px] sm:text-[15px] leading-[1.6] tracking-[0.01em] text-white/50">
              {feature.description}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
