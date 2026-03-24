type AIWinDonutChartProps = {
  winPct: number;
  otherSegments: number[];
};

export function AIWinDonutChart({ winPct, otherSegments }: AIWinDonutChartProps) {
  const size = 200;
  const center = size / 2;
  const r = 70;
  const stroke = 20;
  const circumference = 2 * Math.PI * r;
  const totalOther = otherSegments.reduce((a, b) => a + b, 0);
  const remaining = 100 - winPct;

  const segments: { pct: number; color: string }[] = [
    { pct: winPct, color: "url(#aiWinGrad)" },
    ...otherSegments.map((p, i) => ({
      pct: totalOther > 0 ? (p / totalOther) * remaining : 0,
      color: ["#8B5CF6", "#3B82F6", "#60A5FA", "rgba(255,255,255,0.2)"][i] ?? "rgba(255,255,255,0.2)",
    })),
  ];

  let offsetDeg = 0;

  return (
    <div className="relative inline-flex w-full max-w-full items-center justify-center aspect-square max-h-[200px] sm:max-h-none">
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="w-full h-full min-w-0 min-h-0 overflow-visible"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id="aiWinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#28E88E" />
            <stop offset="100%" stopColor="#fbbf24" />
          </linearGradient>
        </defs>
        {segments.map((seg, i) => {
          const dash = (seg.pct / 100) * circumference;
          const gap = circumference - dash;
          const rotation = offsetDeg;
          offsetDeg += (seg.pct / 100) * 360;
          return (
            <circle
              key={i}
              cx={center}
              cy={center}
              r={r}
              fill="none"
              stroke={seg.color}
              strokeWidth={stroke}
              strokeDasharray={`${dash} ${gap}`}
              strokeDashoffset={0}
              transform={`rotate(${-90 + rotation} ${center} ${center})`}
            />
          );
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="font-inter text-2xl font-bold text-[#fbbf24] sm:text-3xl">{winPct}%</span>
        <span className="font-inter text-[10px] text-white/80 mt-0.5 sm:text-xs">Win Chance</span>
      </div>
    </div>
  );
}
