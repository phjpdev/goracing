import Image from "next/image";

const ANALYTICS_CARD_CLASS =
  "overflow-hidden rounded-[12px] border border-[#3B3B3B] bg-[linear-gradient(180deg,rgba(255,255,255,0)_0%,rgba(255,255,255,0.05)_100%)] shadow-[-20px_24px_74px_rgba(255,255,255,0.05)]";

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
    <section className="mx-auto mt-12 sm:mt-16 lg:mt-[80px] w-full max-w-[1360px] px-4 sm:px-6 lg:px-8">
      <div className="text-center">
        <h2 className="text-[28px] sm:text-[34px] lg:text-[40px] font-medium leading-[1.3] tracking-[0] text-white">
          Visual Analytics
        </h2>
        <p className="mx-auto mt-3 max-w-[640px] font-inter text-[14px] sm:text-[16px] font-light leading-[1.5] text-white/90 px-2">
          Powerful visuals transform raw racing data into patterns you can read at a glance and act on with confidence.
        </p>
      </div>
      <div className="mt-8 sm:mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {ANALYTICS_ITEMS.map((item) => (
          <article key={item.title} className={ANALYTICS_CARD_CLASS}>
            <div className="relative h-[240px] w-full rounded-t-lg">
              <Image src={item.image} alt={item.title} fill className="object-cover" />
            </div>
            <div className="p-6">
              <h3 className="text-[20px] font-semibold leading-[1.3] text-white">{item.title}</h3>
              <p className="mt-2 font-inter text-[14px] leading-[1.5] text-[#D3D3D3]">{item.description}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
