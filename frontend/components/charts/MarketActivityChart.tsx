export function MarketActivityChart() {
  const w = 320;
  const h = 240;
  const pad = { top: 20, right: 20, bottom: 36, left: 40 };
  const plotW = w - pad.left - pad.right;
  const plotH = h - pad.top - pad.bottom;

  const xMax = 45;
  const yMax = 20;

  const points = [
    { x: 5, y: 8, c: "green", size: 5 },
    { x: 10, y: 8, c: "green", size: 5 },
    { x: 15, y: 11, c: "green", size: 5.5 },
    { x: 20, y: 13, c: "green", size: 5.5 },
    { x: 25, y: 16, c: "green", size: 6 },
    { x: 30, y: 16, c: "green", size: 5 },
    { x: 35, y: 18, c: "red", size: 8 },
    { x: 35, y: 13, c: "white", size: 4.5 },
    { x: 40, y: 17, c: "white", size: 5 },
  ];

  const sx = (v: number) => pad.left + (v / xMax) * plotW;
  const sy = (v: number) => pad.top + plotH - (v / yMax) * plotH;

  const xTicks = [5, 10, 15, 20, 25, 30, 35, 40];
  const yTicks = [0, 5, 10, 15, 20];

  const colorMap: Record<string, { fill: string; glow: string }> = {
    green: { fill: "#28E88E", glow: "rgba(40,232,142,0.4)" },
    red: { fill: "#F43F5E", glow: "rgba(244,63,94,0.4)" },
    white: { fill: "rgba(180,180,180,0.7)", glow: "rgba(180,180,180,0.2)" },
  };

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="w-full h-auto overflow-visible"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <filter id="dotGlow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="3" />
        </filter>
      </defs>

      {/* Horizontal grid lines */}
      {yTicks.map((v) => (
        <line
          key={v}
          x1={pad.left}
          y1={sy(v)}
          x2={w - pad.right}
          y2={sy(v)}
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={0.8}
        />
      ))}

      {/* Y axis labels */}
      {yTicks.map((v) => (
        <text
          key={v}
          x={pad.left - 8}
          y={sy(v)}
          className="fill-white/40 font-inter text-[9px]"
          textAnchor="end"
          dominantBaseline="middle"
        >
          {v}
        </text>
      ))}

      {/* X axis labels */}
      {xTicks.map((v) => (
        <text
          key={v}
          x={sx(v)}
          y={h - pad.bottom + 16}
          className="fill-white/40 font-inter text-[9px]"
          textAnchor="middle"
        >
          {v}
        </text>
      ))}

      {/* Y axis title */}
      <text
        x={12}
        y={pad.top + plotH / 2}
        className="fill-white/40 font-inter text-[10px]"
        textAnchor="middle"
        dominantBaseline="middle"
        transform={`rotate(-90, 12, ${pad.top + plotH / 2})`}
      >
        Odds
      </text>

      {/* X axis title */}
      <text
        x={pad.left + plotW / 2}
        y={h - 4}
        className="fill-white/40 font-inter text-[10px]"
        textAnchor="middle"
      >
        Win Probability
      </text>

      {/* Dot glows */}
      {points.map((p, i) => (
        <circle
          key={`g${i}`}
          cx={sx(p.x)}
          cy={sy(p.y)}
          r={p.size * 1.5}
          fill={colorMap[p.c].glow}
          filter="url(#dotGlow)"
        />
      ))}

      {/* Dots */}
      {points.map((p, i) => (
        <circle
          key={i}
          cx={sx(p.x)}
          cy={sy(p.y)}
          r={p.size}
          fill={colorMap[p.c].fill}
        />
      ))}
    </svg>
  );
}
