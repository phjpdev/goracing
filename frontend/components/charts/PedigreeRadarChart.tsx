"use client";

import { useEffect, useRef, useState } from "react";

type PedigreeRadarChartProps = {
  values: number[];
  labels: string[];
};

export function PedigreeRadarChart({ values, labels }: PedigreeRadarChartProps) {
  const size = 220;
  const center = size / 2;
  const radius = 80;
  const n = values.length;
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

  const getPoint = (index: number, scale: number) => {
    const angle = (index / n) * 2 * Math.PI - Math.PI / 2;
    return {
      x: center + scale * radius * Math.cos(angle),
      y: center + scale * radius * Math.sin(angle),
    };
  };

  const makePath = (points: { x: number; y: number }[]) =>
    points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";

  const dataPoints = values.map((v, i) => getPoint(i, v / 100));
  const dataPath = makePath(dataPoints);

  const gridLevels = [0.2, 0.4, 0.6, 0.8, 1];
  const labelPoints = labels.map((text, i) => ({ ...getPoint(i, 1.3), text }));
  const axisPoints = Array.from({ length: n }, (_, i) => getPoint(i, 1));

  return (
    <div ref={containerRef}>
      <style>{`
        @keyframes radar-expand {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          60% {
            transform: scale(1.05);
            opacity: 0.9;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        @keyframes radar-grid-fade {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }
      `}</style>
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="w-full h-full min-w-0 min-h-0 overflow-visible"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <filter id="pedigreeGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="12" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="pedigreeFill" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#5EEEAD" />
            <stop offset="100%" stopColor="#28C878" />
          </linearGradient>
        </defs>

        {/* 1. Data polygon — behind grid */}
        <g style={{
          transformOrigin: `${center}px ${center}px`,
          ...(visible
            ? { animation: "radar-expand 0.8s ease-out 0.3s both" }
            : { opacity: 0, transform: "scale(0)" }),
        }}>
          <path
            d={dataPath}
            fill="url(#pedigreeFill)"
            fillOpacity={0.85}
            filter="url(#pedigreeGlow)"
          />
          <path
            d={dataPath}
            fill="none"
            stroke="#5EEEAD"
            strokeWidth={1.5}
            strokeOpacity={0.6}
          />
        </g>

        {/* 2. Grid rings — on top */}
        {gridLevels.map((scale, gi) => {
          const pts = Array.from({ length: n }, (_, i) => getPoint(i, scale));
          const d = makePath(pts);
          return (
            <path
              key={scale}
              d={d}
              fill="none"
              stroke="rgba(255,255,255,0.25)"
              strokeWidth={1.2}
              style={visible
                ? { animation: `radar-grid-fade 0.4s ease-out ${gi * 0.1}s both` }
                : { opacity: 0 }
              }
            />
          );
        })}

        {/* 3. Axis lines — on top */}
        {axisPoints.map((p, i) => (
          <line
            key={i}
            x1={center}
            y1={center}
            x2={p.x}
            y2={p.y}
            stroke="rgba(255,255,255,0.2)"
            strokeWidth={1}
            style={visible
              ? { animation: `radar-grid-fade 0.4s ease-out ${i * 0.08}s both` }
              : { opacity: 0 }
            }
          />
        ))}

        {/* 4. Tick marks */}
        {gridLevels.map((scale) =>
          axisPoints.map((_, i) => {
            const pt = getPoint(i, scale);
            const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
            const perpX = -Math.sin(angle) * 3;
            const perpY = Math.cos(angle) * 3;
            return (
              <line
                key={`${scale}-${i}`}
                x1={pt.x - perpX}
                y1={pt.y - perpY}
                x2={pt.x + perpX}
                y2={pt.y + perpY}
                stroke="rgba(255,255,255,0.2)"
                strokeWidth={0.8}
                style={visible ? { animation: `radar-grid-fade 0.3s ease-out 0.2s both` } : { opacity: 0 }}
              />
            );
          })
        )}

        {/* 5. Labels — fade in last */}
        {labelPoints.map((lp, i) => (
          <text
            key={i}
            x={lp.x}
            y={lp.y}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-white/60 text-[10px] font-inter"
            style={visible
              ? { animation: `radar-grid-fade 0.4s ease-out ${0.5 + i * 0.08}s both` }
              : { opacity: 0 }
            }
          >
            {lp.text}
          </text>
        ))}
      </svg>
    </div>
  );
}
