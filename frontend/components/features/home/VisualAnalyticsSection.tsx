import Image from "next/image";

const ANALYTICS_CARD_CLASS =
  "overflow-hidden rounded-[16px] border border-white/[0.08] bg-white/[0.03] transition-all duration-300 hover:border-white/[0.15] hover:bg-white/[0.06]";

const ANALYTICS_ITEMS = [
  {
    image: "/assets/Frame1.png",
    title: "Seasonal Heatmaps",
    description:
      "Identify performance trends across seasons, distances, and track conditions to spot long-term advantages.",
  },
  {
    image: "/assets/Frame2.png",
    title: "Market Activity",
    description:
      "Monitor odds fluctuations and betting momentum in real time to understand market confidence and value shifts.",
  },
  {
    image: "/assets/Frame3.png",
    title: "Pedigree Radar Analysis",
    description:
      "Visualize bloodline strengths and weaknesses to assess suitability for distance, surface, and conditions.",
  },
];

export function VisualAnalyticsSection() {
  return (
    <section className="mx-auto mt-16 sm:mt-24 lg:mt-32 w-full max-w-[1360px] px-5 sm:px-6 lg:px-10">
      <div className="text-center">
        <h2 className="text-[28px] sm:text-[34px] lg:text-[40px] font-semibold leading-[1.2] tracking-[-0.01em] text-white">
          Visual Analytics
        </h2>
        <p className="mx-auto mt-4 max-w-[560px] font-inter text-[15px] sm:text-[16px] font-light leading-[1.6] text-white/50">
          Powerful visuals transform raw racing data into patterns you can read at a glance and act on with confidence.
        </p>
      </div>
      <div className="mt-10 sm:mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {ANALYTICS_ITEMS.map((item) => (
          <article key={item.title} className={ANALYTICS_CARD_CLASS}>
            <div className="relative h-[220px] sm:h-[260px] w-full">
              <Image src={item.image} alt={item.title} fill className="object-cover" />
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
