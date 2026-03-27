import Image from "next/image";

const FEATURE_CARD_CLASS =
  "group flex h-auto flex-col rounded-[16px] border border-white/[0.08] bg-white/[0.03] p-6 lg:p-7 transition-all duration-300 hover:border-white/[0.15] hover:bg-white/[0.06]";

const FEATURES = [
  {
    icon: "/assets/Frame 2147224662.png",
    title: "AI Racing Intelligence Platform",
    description:
      "Advanced algorithms analyze form, conditions, and trends to deliver insights before the race begins.",
  },
  {
    icon: "/assets/id-card.png",
    title: "The Smart Race Card Experience",
    description:
      "Redesigned race card that brings odds, trends, and runner insights into streamlined, decision-ready view.",
  },
  {
    icon: "/assets/zap.png",
    title: "Predictive Intelligence",
    description:
      "Forecast race outcomes using data-driven probabilities that adapt to live market and track changes.",
  },
  {
    icon: "/assets/eye.png",
    title: "See The Race Before It Happens",
    description:
      "Simulate race scenarios and understand how pace, draw, and conditions can shape the final result.",
  },
];

export function FeatureCards() {
  return (
    <section className="mt-10 sm:mt-16 lg:mt-24 w-full max-w-[1360px] mx-auto px-5 sm:px-6 lg:px-10">
      <style>{`
        @keyframes icon-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.2; }
        }
      `}</style>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-5">
        {FEATURES.map((feature) => (
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
