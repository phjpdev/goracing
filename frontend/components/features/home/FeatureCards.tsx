import Image from "next/image";

const FEATURE_CARD_CLASS =
  "flex min-h-[301px] h-auto flex-1 flex-row items-center gap-6 rounded-[12px] border border-[#3B3B3B] bg-[linear-gradient(180deg,rgba(255,255,255,0)_0%,rgba(255,255,255,0.05)_100%)] px-5 shadow-[-20px_24px_74px_rgba(255,255,255,0.05)]";

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
    <section className="mt-8 sm:mt-12 lg:mt-[60px] w-full max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 sm:gap-4 lg:gap-4">
        {FEATURES.map((feature) => (
          <article key={feature.title} className={FEATURE_CARD_CLASS}>
            <div className="flex min-h-[262px] w-full max-w-[288px] flex-col items-start gap-4 py-6 lg:py-8">
              <div className="flex h-11 items-center justify-center">
                <Image src={feature.icon} alt="" width={54} height={44} className="h-11" />
              </div>
              <div className="flex min-h-0 w-full flex-col items-start gap-1">
                <h2 className="w-full max-w-[260px] text-[20px] sm:text-[24px] leading-[1.3] text-white">
                  {feature.title}
                </h2>
                <p className="w-full max-w-[288px] text-[14px] sm:text-[16px] leading-[1.5] tracking-[0.01em] text-[#D3D3D3]">
                  {feature.description}
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
