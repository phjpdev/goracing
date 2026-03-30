type AIWinDonutChartProps = {
  winPct: number;
  otherSegments: number[];
};

export function AIWinDonutChart({ winPct }: AIWinDonutChartProps) {
  // Match Figma layout: 343 × 351
  const vw = 343;
  const vh = 351;
  // Center derived from Figma ring positions
  const cx = 175.8;
  const cy = 195.3;
  // Ring radii from Figma (outer: 243.24/2, inner: 148.6/2)
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
          {/* Win arc gradient: Figma 112.6deg #FFB700 → #AEFFAC */}
          <linearGradient id="wg" x1="0%" y1="0%" x2="60%" y2="100%">
            <stop offset="9%" stopColor="#FFB700" />
            <stop offset="87%" stopColor="#AEFFAC" />
          </linearGradient>

          {/* Yellow glow blur: Figma blur(110.86px) */}
          <filter id="yb" x="-300%" y="-300%" width="700%" height="700%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="55" />
          </filter>

          {/* Arc shadow: Figma box-shadow 0 0 84.86px #FFF700 */}
          <filter id="as" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="12" />
          </filter>

          {/* Glass gradient: Figma 114.96deg */}
          <linearGradient id="gl" gradientTransform="rotate(115)">
            <stop offset="17%" stopColor="rgba(249,209,107,0.2)" />
            <stop offset="88%" stopColor="rgba(250,253,166,0.2)" />
          </linearGradient>
        </defs>

        {/* Yellow ambient glow — Figma: 93.9×93.9 at (53.21, 175.83) blur 110.86 */}
        <ellipse cx={100} cy={223} rx={47} ry={47} fill="#E3CF39" filter="url(#yb)" opacity={0.45} />

        {/* Outer ring — Figma: stroke 2.9573 rgba(255,255,255,0.21) */}
        <circle cx={cx} cy={cy} r={outerR} fill="none" stroke="rgba(255,255,255,0.21)" strokeWidth={2.96} />

        {/* Inner ring */}
        <circle cx={cx} cy={cy} r={innerR} fill="none" stroke="rgba(255,255,255,0.21)" strokeWidth={2.96} />

        {/* Frosted glass shape — mirrored to match arc direction */}
        <rect
          x={cx - 20}
          y={58}
          width={98}
          height={110.5}
          rx={4}
          fill="rgba(249,209,107,0.08)"
          transform={`rotate(9.38, ${cx + 29}, 113.3)`}
        />

        {/* Arc group — mirrored horizontally so arc goes counter-clockwise (left) */}
        <g transform={`translate(${cx * 2}, 0) scale(-1, 1)`}>
          {/* Arc glow layer */}
          <circle
            cx={cx} cy={cy} r={mainR}
            fill="none"
            stroke="url(#wg)"
            strokeWidth={arcStroke + 6}
            strokeDasharray={`${winDash} ${circumference}`}
            strokeLinecap="round"
            transform={`rotate(-90 ${cx} ${cy})`}
            filter="url(#as)"
            opacity={0.5}
          />

          {/* Main win arc */}
          <circle
            cx={cx} cy={cy} r={mainR}
            fill="none"
            stroke="url(#wg)"
            strokeWidth={arcStroke}
            strokeDasharray={`${winDash} ${circumference}`}
            strokeLinecap="round"
            transform={`rotate(-90 ${cx} ${cy})`}
            style={{ filter: "drop-shadow(0 0 16px rgba(255,247,0,0.35))" }}
          />
        </g>

        {/* Green decorative arc — Figma: 129.85×65.43 at (45.6, 33.8) stroke #57BF9C */}
        <path
          d={describeArc(outerR + 35, -168, -102)}
          fill="none" stroke="#57BF9C" strokeWidth={2.96} strokeLinecap="round"
        />

        {/* Purple decorative arc — Figma: 200.34×59.89 at (58.29, 50.8) stroke #C09FF8 */}
        <path
          d={describeArc(outerR + 25, -162, -78)}
          fill="none" stroke="#C09FF8" strokeWidth={2.96} strokeLinecap="round"
        />

        {/* Orange decorative arc — Figma: 72.08×5.49 at (139.23, 75.27) stroke #ECB265 */}
        <path
          d={describeArc(outerR + 14, -118, -93)}
          fill="none" stroke="#ECB265" strokeWidth={2.96} strokeLinecap="round"
        />
      </svg>

      {/* Center text — Figma: at calc(50% - 73px/2 + 4.27px), top: 188.82px */}
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
