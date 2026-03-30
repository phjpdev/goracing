type PedigreeRadarChartProps = {
  values: number[];
  labels: string[];
};

export function PedigreeRadarChart({ values, labels }: PedigreeRadarChartProps) {
  const size = 220;
  const center = size / 2;
  const radius = 80;
  const n = values.length;

  const getPoint = (index: number, scale: number) => {
    const angle = (index / n) * 2 * Math.PI - Math.PI / 2;
    return {
      x: center + scale * radius * Math.cos(angle),
      y: center + scale * radius * Math.sin(angle),
    };
  };

  // Data polygon
  const dataPoints = values.map((v, i) => getPoint(i, v / 100));
  const dataPath = dataPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";

  // Grid rings
  const gridLevels = [0.25, 0.5, 0.75, 1];

  // Label positions
  const labelPoints = labels.map((text, i) => {
    const pt = getPoint(i, 1.28);
    return { ...pt, text };
  });

  // Axis lines
  const axisPoints = Array.from({ length: n }, (_, i) => getPoint(i, 1));

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className="w-full h-full min-w-0 min-h-0 overflow-visible"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        {/* Glow filter */}
        <filter id="pedigreeGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="12" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        {/* Fill gradient */}
        <linearGradient id="pedigreeFill" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#5EEEAD" />
          <stop offset="100%" stopColor="#28C878" />
        </linearGradient>
      </defs>

      {/* Grid rings (pentagon shapes) */}
      {gridLevels.map((scale) => {
        const pts = Array.from({ length: n }, (_, i) => getPoint(i, scale));
        const d = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";
        return <path key={scale} d={d} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={0.8} />;
      })}

      {/* Axis lines from center to each vertex */}
      {axisPoints.map((p, i) => (
        <line key={i} x1={center} y1={center} x2={p.x} y2={p.y} stroke="rgba(255,255,255,0.06)" strokeWidth={0.8} />
      ))}

      {/* Data fill with glow */}
      <path
        d={dataPath}
        fill="url(#pedigreeFill)"
        fillOpacity={0.85}
        filter="url(#pedigreeGlow)"
      />

      {/* Data stroke */}
      <path
        d={dataPath}
        fill="none"
        stroke="#5EEEAD"
        strokeWidth={1.5}
        strokeOpacity={0.6}
      />

      {/* Labels */}
      {labelPoints.map((lp, i) => (
        <text
          key={i}
          x={lp.x}
          y={lp.y}
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-white/50 text-[10px] font-inter"
        >
          {lp.text}
        </text>
      ))}
    </svg>
  );
}
