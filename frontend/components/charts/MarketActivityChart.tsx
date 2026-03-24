export function MarketActivityChart() {
  const w = 260;
  const h = 160;
  const padding = { top: 12, right: 12, bottom: 28, left: 32 };
  const plotW = w - padding.left - padding.right;
  const plotH = h - padding.top - padding.bottom;

  const points = [
    { x: 5, y: 4, c: "green" },
    { x: 12, y: 8, c: "green" },
    { x: 18, y: 6, c: "white" },
    { x: 25, y: 14, c: "red" },
    { x: 32, y: 10, c: "white" },
    { x: 38, y: 18, c: "red" },
  ];

  const scaleX = (v: number) => padding.left + (v / 40) * plotW;
  const scaleY = (v: number) => padding.top + plotH - (v / 20) * plotH;
  const yAxisLabelX = padding.left - 10;
  const yAxisLabelY = padding.top + plotH / 2;
  const xAxisLabelX = padding.left + plotW / 2;
  const xAxisLabelY = h - 6;

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="w-full max-w-[260px] h-auto overflow-visible sm:max-w-none"
      preserveAspectRatio="xMidYMid meet"
    >
      <line
        x1={padding.left}
        y1={padding.top}
        x2={padding.left}
        y2={h - padding.bottom}
        stroke="rgba(255,255,255,0.2)"
        strokeWidth={1}
      />
      <line
        x1={padding.left}
        y1={h - padding.bottom}
        x2={w - padding.right}
        y2={h - padding.bottom}
        stroke="rgba(255,255,255,0.2)"
        strokeWidth={1}
      />
      <text
        x={yAxisLabelX}
        y={yAxisLabelY}
        className="fill-white/60 font-inter text-[10px]"
        textAnchor="middle"
        dominantBaseline="middle"
        transform={`rotate(-90, ${yAxisLabelX}, ${yAxisLabelY})`}
      >
        Odds
      </text>
      <text
        x={xAxisLabelX}
        y={xAxisLabelY}
        className="fill-white/60 font-inter text-[10px]"
        textAnchor="middle"
        dominantBaseline="auto"
      >
        Win Probability
      </text>
      {points.map((p, i) => (
        <circle
          key={i}
          cx={scaleX(p.x)}
          cy={scaleY(p.y)}
          r={6}
          fill={p.c === "green" ? "#28E88E" : p.c === "red" ? "#f87171" : "rgba(255,255,255,0.6)"}
          className="drop-shadow-sm"
        />
      ))}
    </svg>
  );
}
