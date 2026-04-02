"use client";

import { useEffect, useRef, useState } from "react";

type MarketPoint = {
  winProb: number;
  odds: number;
  trend: "dropping" | "drifting" | "stable";
};

type MarketActivityChartProps = {
  points?: MarketPoint[];
};

export function MarketActivityChart({ points }: MarketActivityChartProps) {
  const w = 320;
  const h = 240;
  const pad = { top: 20, right: 20, bottom: 36, left: 40 };
  const plotW = w - pad.left - pad.right;
  const plotH = h - pad.top - pad.bottom;
  const containerRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const data = points && points.length > 0 ? points : defaultPoints;
  const maxX = Math.ceil(Math.max(...data.map((p) => p.winProb)) / 5) * 5 + 5;
  const maxY = Math.ceil(Math.max(...data.map((p) => p.odds)) / 5) * 5;

  const sx = (v: number) => pad.left + (v / maxX) * plotW;
  const sy = (v: number) => pad.top + plotH - (v / maxY) * plotH;
  const bottomY = pad.top + plotH;

  const xTicks = Array.from({ length: Math.floor(maxX / 5) }, (_, i) => (i + 1) * 5);
  const yTicks = Array.from({ length: maxY / 5 + 1 }, (_, i) => i * 5);

  const colorMap: Record<string, { fill: string; glow: string }> = {
    dropping: { fill: "#28E88E", glow: "rgba(40,232,142,0.4)" },
    drifting: { fill: "#F43F5E", glow: "rgba(244,63,94,0.4)" },
    stable: { fill: "rgba(180,180,180,0.7)", glow: "rgba(180,180,180,0.2)" },
  };

  const getSize = (winProb: number) => {
    const min = 4, max = 7;
    const ratio = Math.min(winProb / maxX, 1);
    return min + ratio * (max - min);
  };

  return (
    <div ref={containerRef}>
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

        {/* Grid + labels */}
        <g style={{ opacity: visible ? 1 : 0, transition: "opacity 0.4s ease-out" }}>
          {yTicks.map((v) => (
            <line key={v} x1={pad.left} y1={sy(v)} x2={w - pad.right} y2={sy(v)} stroke="rgba(255,255,255,0.06)" strokeWidth={0.8} />
          ))}
          {yTicks.map((v) => (
            <text key={v} x={pad.left - 8} y={sy(v)} className="fill-white/40 font-inter text-[9px]" textAnchor="end" dominantBaseline="middle">{v}</text>
          ))}
          {xTicks.map((v) => (
            <text key={v} x={sx(v)} y={h - pad.bottom + 16} className="fill-white/40 font-inter text-[9px]" textAnchor="middle">{v}</text>
          ))}
          <text x={12} y={pad.top + plotH / 2} className="fill-white/40 font-inter text-[10px]" textAnchor="middle" dominantBaseline="middle" transform={`rotate(-90, 12, ${pad.top + plotH / 2})`}>Odds</text>
          <text x={pad.left + plotW / 2} y={h - 4} className="fill-white/40 font-inter text-[10px]" textAnchor="middle">Win Probability</text>
        </g>

        {/* Dots — use translateY for rise animation */}
        {data.map((p, i) => {
          const s = getSize(p.winProb);
          const targetY = sy(p.odds);
          const riseDistance = bottomY - targetY;
          const delay = 0.2 + i * 0.08;

          return (
            <g
              key={i}
              style={{
                transform: visible ? "translateY(0)" : `translateY(${riseDistance}px)`,
                opacity: visible ? 1 : 0,
                transition: `transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) ${delay}s, opacity 0.3s ease-out ${delay}s`,
              }}
            >
              <circle
                cx={sx(p.winProb)}
                cy={targetY}
                r={s * 1.5}
                fill={colorMap[p.trend].glow}
                filter="url(#dotGlow)"
              />
              <circle
                cx={sx(p.winProb)}
                cy={targetY}
                r={s}
                fill={colorMap[p.trend].fill}
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
}

const defaultPoints: MarketPoint[] = [
  { winProb: 5, odds: 8, trend: "dropping" },
  { winProb: 10, odds: 8, trend: "dropping" },
  { winProb: 15, odds: 11, trend: "dropping" },
  { winProb: 20, odds: 13, trend: "dropping" },
  { winProb: 25, odds: 16, trend: "dropping" },
  { winProb: 30, odds: 16, trend: "dropping" },
  { winProb: 35, odds: 18, trend: "drifting" },
  { winProb: 35, odds: 13, trend: "stable" },
  { winProb: 40, odds: 17, trend: "stable" },
];
