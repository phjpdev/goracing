type PedigreeRadarChartProps = {
  values: number[];
  labels: string[];
};

export function PedigreeRadarChart({ values, labels }: PedigreeRadarChartProps) {
  const size = 180;
  const center = size / 2;
  const radius = 70;
  const n = values.length;
  const points: { x: number; y: number }[] = [];
  const labelPoints: { x: number; y: number; text: string }[] = [];

  for (let i = 0; i < n; i++) {
    const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
    const r = (values[i] / 100) * radius;
    points.push({ x: center + r * Math.cos(angle), y: center + r * Math.sin(angle) });
    const lr = radius + 24;
    labelPoints.push({
      x: center + lr * Math.cos(angle),
      y: center + lr * Math.sin(angle),
      text: labels[i],
    });
  }

  const fillPath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className="w-full h-full min-w-0 min-h-0 overflow-visible"
      preserveAspectRatio="xMidYMid meet"
    >
      {/* grid rings */}
      {[0.25, 0.5, 0.75, 1].map((scale) => {
        const pts = points.map((p) => ({
          x: center + (p.x - center) * scale,
          y: center + (p.y - center) * scale,
        }));
        const d = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";
        return <path key={scale} d={d} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={1} />;
      })}
      {/* fill */}
      <path
        d={fillPath}
        fill="rgba(40,232,142,0.35)"
        stroke="#28E88E"
        strokeWidth={1.5}
        className="drop-shadow-[0_0_12px_rgba(40,232,142,0.5)]"
      />
      {/* labels */}
      {labelPoints.map((lp, i) => (
        <text
          key={i}
          x={lp.x}
          y={lp.y}
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-white/70 text-[10px] font-inter"
        >
          {lp.text}
        </text>
      ))}
    </svg>
  );
}
