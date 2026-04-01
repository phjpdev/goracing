import Image from "next/image";

type AIWinDonutChartProps = {
  winPct: number;
  otherSegments: number[];
};

export function AIWinDonutChart({ winPct }: AIWinDonutChartProps) {
  return (
    <div className="relative inline-flex w-full max-w-full items-center justify-center aspect-square">
      <Image
        src="/assets/Win-Probability.png"
        alt="AI Win Probability"
        width={340}
        height={340}
        className="w-full h-auto object-contain"
      />
      <div
        className="absolute flex flex-col items-center justify-center pointer-events-none"
        style={{ left: "58%", top: "50%", transform: "translate(-50%, -50%)" }}
      >
        <span className="font-inter text-[24px] font-medium text-[#EEC625] leading-[1.3]">
          {winPct}%
        </span>
        <span className="font-inter text-[10px] font-light text-[#D3D3D3] tracking-[0.01em] text-center leading-[1.5]">
          Win Chance
        </span>
      </div>
    </div>
  );
}
