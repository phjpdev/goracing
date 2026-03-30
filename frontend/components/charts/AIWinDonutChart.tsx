type AIWinDonutChartProps = {
  winPct: number;
  otherSegments: number[];
};

export function AIWinDonutChart({ winPct, otherSegments }: AIWinDonutChartProps) {
  const size = 220;
  const center = size / 2;
  const mainR = 65;
  const mainStroke = 22;
  const circumference = 2 * Math.PI * mainR;

  const totalOther = otherSegments.reduce((a, b) => a + b, 0);
  const remaining = 100 - winPct;

  // Main donut segments
  const segments: { pct: number; color: string }[] = [
    { pct: winPct, color: "url(#winArcGrad)" },
    ...otherSegments.map((p, i) => ({
      pct: totalOther > 0 ? (p / totalOther) * remaining : 0,
      color: ["#7C3AED", "#6366F1", "#818CF8", "rgba(255,255,255,0.15)"][i] ?? "rgba(255,255,255,0.15)",
    })),
  ];

  let offsetDeg = -90;

  // Decorative arcs above the donut
  const arcColors = ["#2DD4A0", "#F59E0B", "#8B5CF6"];
  const arcRadii = [95, 88, 81];
  const arcStarts = [-50, -30, -15];
  const arcLengths = [55, 40, 30];

  const describeArc = (cx: number, cy: number, r: number, startAngle: number, endAngle: number) => {
    const start = {
      x: cx + r * Math.cos((startAngle * Math.PI) / 180),
      y: cy + r * Math.sin((startAngle * Math.PI) / 180),
    };
    const end = {
      x: cx + r * Math.cos((endAngle * Math.PI) / 180),
      y: cy + r * Math.sin((endAngle * Math.PI) / 180),
    };
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;
    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`;
  };

  return (
    <div className="relative inline-flex w-full max-w-full items-center justify-center aspect-square max-h-[220px] sm:max-h-none">
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="w-full h-full min-w-0 min-h-0 overflow-visible"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* Main win segment gradient */}
          <linearGradient id="winArcGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#28E88E" />
            <stop offset="50%" stopColor="#A3E635" />
            <stop offset="100%" stopColor="#FACC15" />
          </linearGradient>
          {/* Glow filter */}
          <filter id="donutGlow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Decorative arcs */}
        {arcColors.map((color, i) => (
          <path
            key={i}
            d={describeArc(center, center, arcRadii[i], arcStarts[i], arcStarts[i] + arcLengths[i])}
            fill="none"
            stroke={color}
            strokeWidth={2.5}
            strokeLinecap="round"
            opacity={0.7}
          />
        ))}

        {/* Track ring (background) */}
        <circle
          cx={center}
          cy={center}
          r={mainR}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={mainStroke}
        />

        {/* Donut segments */}
        {segments.map((seg, i) => {
          const dash = (seg.pct / 100) * circumference;
          const gap = circumference - dash;
          const rotation = offsetDeg;
          offsetDeg += (seg.pct / 100) * 360;
          if (dash <= 0) return null;
          return (
            <circle
              key={i}
              cx={center}
              cy={center}
              r={mainR}
              fill="none"
              stroke={seg.color}
              strokeWidth={mainStroke}
              strokeDasharray={`${dash} ${gap}`}
              strokeDashoffset={0}
              strokeLinecap={i === 0 ? "round" : "butt"}
              transform={`rotate(${rotation} ${center} ${center})`}
              filter={i === 0 ? "url(#donutGlow)" : undefined}
            />
          );
        })}
      </svg>

      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="font-inter text-[28px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#28E88E] to-[#FACC15] sm:text-3xl">
          {winPct}%
        </span>
        <span className="font-inter text-[10px] text-white/60 mt-0.5 sm:text-xs">Win Chance</span>
      </div>
    </div>
  );
}
