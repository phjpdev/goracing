type AIWinDonutChartProps = {
  winPct: number;
  otherSegments: number[];
};

export function AIWinDonutChart({ winPct }: AIWinDonutChartProps) {
  const vw = 343;
  const vh = 351;
  const cx = 175.8;
  const cy = 195.3;
  const outerR = 121.6;
  const innerR = 74.3;
  const mainR = (outerR + innerR) / 2;
  const arcStroke = outerR - innerR;
  const circumference = 2 * Math.PI * mainR;
  const winDash = (winPct / 100) * circumference;

  const toRad = (d: number) => (d * Math.PI) / 180;
  const describeArc = (r: number, s: number, e: number) => {
    const sp = { x: cx + r * Math.cos(toRad(s)), y: cy + r * Math.sin(toRad(s)) };
    const ep = { x: cx + r * Math.cos(toRad(e)), y: cy + r * Math.sin(toRad(e)) };
    return `M ${sp.x} ${sp.y} A ${r} ${r} 0 ${e - s > 180 ? 1 : 0} 1 ${ep.x} ${ep.y}`;
  };

  return (
    <div className="relative inline-flex w-full max-w-full items-center justify-center aspect-square max-h-[340px] sm:max-h-none">
      <svg
        viewBox={`0 0 ${vw} ${vh}`}
        className="w-full h-full min-w-0 min-h-0 overflow-visible"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* Arc gradient: vertical so mirror doesn't flip it. Gold at top → green at bottom */}
          <linearGradient id="wg" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#FFB700" />
            <stop offset="35%" stopColor="#E0C030" />
            <stop offset="65%" stopColor="#C0D860" />
            <stop offset="100%" stopColor="#90EE90" />
          </linearGradient>

          {/* Warm ambient blur */}
          <filter id="yb" x="-300%" y="-300%" width="700%" height="700%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="50" />
          </filter>

          {/* Very soft glow for arc */}
          <filter id="as" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="5" />
          </filter>
        </defs>

        {/* Warm golden ambient glow */}
        <ellipse cx={130} cy={235} rx={50} ry={50} fill="#D4A820" filter="url(#yb)" opacity={0.22} />
        {/* Inner area warm tint */}
        <ellipse cx={cx} cy={cy + 5} rx={35} ry={35} fill="#D4A820" filter="url(#yb)" opacity={0.06} />

        {/* Outer ring */}
        <circle cx={cx} cy={cy} r={outerR} fill="none" stroke="rgba(255,255,255,0.21)" strokeWidth={2.96} />

        {/* Inner ring */}
        <circle cx={cx} cy={cy} r={innerR} fill="none" stroke="rgba(255,255,255,0.21)" strokeWidth={2.96} />

        {/* Arc — counter-clockwise (mirrored) */}
        <g transform={`translate(${cx * 2}, 0) scale(-1, 1)`}>
          {/* Subtle warm glow behind arc */}
          <circle
            cx={cx} cy={cy} r={mainR}
            fill="none"
            stroke="#D4A820"
            strokeWidth={arcStroke + 12}
            strokeDasharray={`${winDash} ${circumference}`}
            strokeLinecap="round"
            transform={`rotate(-90 ${cx} ${cy})`}
            filter="url(#as)"
            opacity={0.12}
          />

          {/* Main arc */}
          <circle
            cx={cx} cy={cy} r={mainR}
            fill="none"
            stroke="url(#wg)"
            strokeWidth={arcStroke}
            strokeDasharray={`${winDash} ${circumference}`}
            strokeLinecap="round"
            transform={`rotate(-90 ${cx} ${cy})`}
            style={{ filter: "drop-shadow(0 0 4px rgba(210,170,30,0.2))" }}
          />
        </g>

        {/* Green decorative arc — outermost */}
        <path
          d={describeArc(outerR + 40, -178, -108)}
          fill="none" stroke="#57BF9C" strokeWidth={2.96} strokeLinecap="round"
        />

        {/* Purple decorative arc — middle, wide span */}
        <path
          d={describeArc(outerR + 26, -160, -68)}
          fill="none" stroke="#C09FF8" strokeWidth={2.96} strokeLinecap="round"
        />

        {/* Orange decorative arc — innermost, short */}
        <path
          d={describeArc(outerR + 15, -112, -90)}
          fill="none" stroke="#ECB265" strokeWidth={2.96} strokeLinecap="round"
        />
      </svg>

      {/* Center text */}
      <div
        className="absolute flex flex-col items-center pointer-events-none"
        style={{ left: "calc(50% + 4px)", top: "54%", transform: "translate(-50%, -50%)" }}
      >
        <span className="font-inter text-[25px] font-medium text-[#EEC625] leading-[1.3]">
          {winPct}%
        </span>
        <span className="font-inter text-[11px] font-light text-[#D3D3D3] tracking-[0.01em] text-center leading-[1.5]">
          Win Chance
        </span>
      </div>
    </div>
  );
}
