"use client";

import * as React from "react";
import type { LandingMarketPoint } from "@/lib/lastLandingAnalytics";

type GraphicProps = {
  className?: string;
  animate?: boolean;
};

function SvgWrap({
  className,
  children,
  viewBox,
  animate,
}: React.PropsWithChildren<{ className?: string; viewBox: string; animate?: boolean }>) {
  return (
    <svg
      className={className}
      viewBox={viewBox}
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid slice"
      data-animate={animate ? "true" : "false"}
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

type BarsRiseGraphicProps = GraphicProps & {
  values?: number[];
};

export function BarsRiseGraphic({ className, animate, values }: BarsRiseGraphicProps) {
  const v = (values && values.length > 0 ? values : [32, 78, 62, 92]).slice(0, 4);
  const targets = v.map((n) => Math.max(0, Math.min(100, n)) / 100);
  return (
    <SvgWrap className={className} viewBox="0 0 360 220" animate={animate}>
      <defs>
        <linearGradient id="vaBars_bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#6b4a1c" stopOpacity="0.9" />
          <stop offset="0.6" stopColor="#1a1a1a" stopOpacity="1" />
          <stop offset="1" stopColor="#0f0f0f" stopOpacity="1" />
        </linearGradient>
        <linearGradient id="vaBars_bar" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#18f08b" />
          <stop offset="0.55" stopColor="#c9ffd8" />
          <stop offset="1" stopColor="#ffb92a" />
        </linearGradient>
        <filter id="vaBars_grain" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.9  0 0 0 0 0.7  0 0 0 0 0.35  0 0 0 0.08 0" />
        </filter>
        <filter id="vaBars_glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feColorMatrix
            in="blur"
            type="matrix"
            values="0 0 0 0 0.1  0 0 0 0 1  0 0 0 0 0.6  0 0 0 0.35 0"
            result="green"
          />
          <feMerge>
            <feMergeNode in="green" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <rect x="0" y="0" width="360" height="220" fill="url(#vaBars_bg)" />
      <rect x="0" y="0" width="360" height="220" filter="url(#vaBars_grain)" opacity="0.55" />

      <g opacity="0.18" fill="#ffffff">
        {Array.from({ length: 9 }).map((_, r) =>
          Array.from({ length: 16 }).map((__, c) => (
            <circle key={`${r}-${c}`} cx={18 + c * 22} cy={18 + r * 22} r={1.2} />
          )),
        )}
      </g>

      <g filter="url(#vaBars_glow)">
        <rect
          className="vaBars_bar"
          style={{ ["--i" as any]: 0, ["--t" as any]: String(Math.max(0.12, targets[0] ?? 0)) }}
          x="58"
          y="32"
          width="44"
          height="174"
          rx="6"
          fill="url(#vaBars_bar)"
        />
        <rect
          className="vaBars_bar"
          style={{ ["--i" as any]: 1, ["--t" as any]: String(Math.max(0.12, targets[1] ?? 0)) }}
          x="124"
          y="32"
          width="52"
          height="174"
          rx="6"
          fill="url(#vaBars_bar)"
        />
        <rect
          className="vaBars_bar"
          style={{ ["--i" as any]: 2, ["--t" as any]: String(Math.max(0.12, targets[2] ?? 0)) }}
          x="198"
          y="32"
          width="52"
          height="174"
          rx="6"
          fill="url(#vaBars_bar)"
        />
        <rect
          className="vaBars_bar"
          style={{ ["--i" as any]: 3, ["--t" as any]: String(Math.max(0.12, targets[3] ?? 0)) }}
          x="272"
          y="32"
          width="44"
          height="174"
          rx="6"
          fill="url(#vaBars_bar)"
        />
      </g>

      <style>{`
        .vaBars_bar {
          transform-box: fill-box;
          transform-origin: 50% 100%;
          transform: scaleY(0.02);
          opacity: 0.25;
          filter: saturate(0.85);
        }
        svg[data-animate="true"] .vaBars_bar {
          animation: vaBars_rise 900ms cubic-bezier(0.22, 1, 0.36, 1) both;
          animation-delay: calc(var(--i) * 120ms);
        }
        @keyframes vaBars_rise {
          0% { transform: scaleY(0.02); filter: saturate(0.85); opacity: 0.25; }
          55% { opacity: 1; }
          100% { transform: scaleY(var(--t)); filter: saturate(1); opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          .vaBars_bar { animation: none !important; transform: none !important; opacity: 1 !important; filter: none !important; }
        }
      `}</style>
    </SvgWrap>
  );
}

type PointsRiseGraphicProps = GraphicProps & {
  points?: LandingMarketPoint[];
};

export function PointsRiseGraphic({ className, animate, points }: PointsRiseGraphicProps) {
  const w = 360;
  const h = 220;
  const pad = { top: 22, right: 18, bottom: 34, left: 34 };
  const plotW = w - pad.left - pad.right;
  const plotH = h - pad.top - pad.bottom;
  const bottomY = pad.top + plotH;

  const data: LandingMarketPoint[] =
    points && points.length > 0
      ? points
      : [
          { winProb: 10, odds: 12, trend: "dropping" },
          { winProb: 15, odds: 14, trend: "dropping" },
          { winProb: 20, odds: 16, trend: "dropping" },
          { winProb: 25, odds: 18, trend: "dropping" },
          { winProb: 30, odds: 20, trend: "dropping" },
          { winProb: 35, odds: 20, trend: "stable" },
          { winProb: 40, odds: 16, trend: "stable" },
          { winProb: 45, odds: 13, trend: "drifting" },
          { winProb: 50, odds: 12, trend: "stable" },
        ];

  const maxX = Math.max(50, Math.ceil(Math.max(...data.map((p) => p.winProb)) / 5) * 5);
  const maxY = Math.max(20, Math.ceil(Math.max(...data.map((p) => p.odds)) / 5) * 5);
  const sx = (v: number) => pad.left + (v / maxX) * plotW;
  const sy = (v: number) => pad.top + plotH - (v / maxY) * plotH;
  const yTicks = [0.2, 0.4, 0.6, 0.8, 1].map((t) => Math.round(t * maxY));

  return (
    <SvgWrap className={className} viewBox="0 0 360 220" animate={animate}>
      <defs>
        <linearGradient id="vaPts_bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ff648b" />
          <stop offset="0.55" stopColor="#f19aa9" />
          <stop offset="1" stopColor="#f4d7de" />
        </linearGradient>
        <filter id="vaPts_grain" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" stitchTiles="stitch" />
          <feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 0.65  0 0 0 0 0.72  0 0 0 0.12 0" />
        </filter>
        <filter id="vaPts_shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feOffset dx="0" dy="1" result="off" />
          <feColorMatrix
            in="off"
            type="matrix"
            values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.25 0"
            result="shadow"
          />
          <feMerge>
            <feMergeNode in="shadow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <rect x="0" y="0" width="360" height="220" fill="url(#vaPts_bg)" />
      <rect x="0" y="0" width="360" height="220" filter="url(#vaPts_grain)" opacity="0.55" />

      <g opacity="0.55" stroke="#1b1b1b" strokeWidth="1">
        {yTicks.map((v) => {
          const y = sy(v);
          return <line key={v} x1={pad.left} x2={w - pad.right} y1={y} y2={y} />;
        })}
      </g>

      <text x="238" y="40" fill="#ffffff" opacity="0.92" fontSize="12" fontWeight="600" fontFamily="Inter, ui-sans-serif, system-ui">
        Win Probability (%)
      </text>

      <g fill="#1b1b1b" opacity="0.7" fontSize="10" fontWeight="600" fontFamily="Inter, ui-sans-serif, system-ui">
        {[10, 15, 20, 25, 30, 35, 40, 45, 50].map((tick) => (
          <text key={tick} x={sx(tick)} y="202" textAnchor="middle">
            {tick}
          </text>
        ))}
      </g>

      <g filter="url(#vaPts_shadow)">
        {data.map((p, idx) => {
          const targetY = sy(p.odds);
          const rise = Math.max(18, bottomY - targetY);
          const color =
            p.trend === "dropping" ? "#21f59b" : p.trend === "drifting" ? "#ff2d6f" : "rgba(230,230,230,0.8)";
          const glow =
            p.trend === "dropping"
              ? "rgba(33,245,155,0.35)"
              : p.trend === "drifting"
                ? "rgba(255,45,111,0.28)"
                : "rgba(255,255,255,0.18)";
          return (
          <g
            key={`${p.winProb}-${p.odds}-${idx}`}
            className="vaPts_point"
            style={
              {
                ["--rise" as any]: `${rise}px`,
                ["--d" as any]: `${idx}`,
              } as React.CSSProperties
            }
          >
            <circle cx={sx(p.winProb)} cy={targetY} r="12" fill={glow} opacity="1" />
            <circle cx={sx(p.winProb)} cy={targetY} r="7.5" fill={color} opacity="0.98" />
          </g>
          );
        })}
      </g>

      <style>{`
        .vaPts_point {
          transform-box: fill-box;
          transform-origin: 50% 100%;
          transform: translateY(var(--rise)) scale(0.92);
          opacity: 0;
          will-change: transform, opacity;
        }
        svg[data-animate="true"] .vaPts_point {
          animation: vaPts_rise 780ms cubic-bezier(0.22, 1, 0.36, 1) both;
          animation-delay: calc(var(--d) * 90ms);
        }
        @keyframes vaPts_rise {
          0% { transform: translateY(var(--rise)) scale(0.92); opacity: 0; }
          60% { opacity: 1; }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          .vaPts_point { animation: none !important; transform: none !important; opacity: 1 !important; }
        }
      `}</style>
    </SvgWrap>
  );
}

type RadarExpandGraphicProps = GraphicProps & {
  values?: number[];
};

export function RadarExpandGraphic({ className, animate, values }: RadarExpandGraphicProps) {
  const cx = 190;
  const cy = 118;
  const size = 80;
  const n = 5;
  const v = (values && values.length > 0 ? values : [78, 84, 66, 72, 58]).slice(0, n);

  const getPoint = (index: number, scale: number) => {
    const angle = (index / n) * 2 * Math.PI - Math.PI / 2;
    return [cx + scale * size * Math.cos(angle), cy + scale * size * Math.sin(angle)] as const;
  };

  const outer = Array.from({ length: n }, (_, i) => getPoint(i, 1));
  const ring = (scale: number) => outer.map(([x, y]) => [cx + (x - cx) * scale, cy + (y - cy) * scale] as const);

  const ptsToD = (pts: readonly (readonly [number, number])[]) =>
    `M ${pts[0][0]} ${pts[0][1]} ` + pts.slice(1).map((p) => `L ${p[0]} ${p[1]}`).join(" ") + " Z";

  const area = Array.from({ length: n }, (_, i) => getPoint(i, Math.max(0, Math.min(100, v[i] ?? 0)) / 100));

  return (
    <SvgWrap className={className} viewBox="0 0 360 220" animate={animate}>
      <defs>
        <linearGradient id="vaRad_bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#28ff8f" />
          <stop offset="0.55" stopColor="#15c96f" />
          <stop offset="1" stopColor="#0d8e4d" />
        </linearGradient>
        <radialGradient id="vaRad_shadow" cx="50%" cy="50%" r="65%">
          <stop offset="0" stopColor="#0a0a0a" stopOpacity="0.0" />
          <stop offset="1" stopColor="#0a0a0a" stopOpacity="0.72" />
        </radialGradient>
        <filter id="vaRad_grain" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="2" stitchTiles="stitch" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.12  0 0 0 0 0.9  0 0 0 0 0.45  0 0 0 0.14 0" />
        </filter>
        <filter id="vaRad_glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feColorMatrix
            in="blur"
            type="matrix"
            values="0 0 0 0 0.0  0 0 0 0 0.95  0 0 0 0 0.55  0 0 0 0.45 0"
            result="g"
          />
          <feMerge>
            <feMergeNode in="g" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <rect x="0" y="0" width="360" height="220" fill="url(#vaRad_bg)" />

      <g opacity="0.75">
        <path d="M-20 110 C 40 40, 120 40, 170 110 C 220 180, 120 215, 60 205 C 10 197, -10 165, -20 110 Z" fill="url(#vaRad_shadow)" />
        <path d="M210 20 C 300 -10, 390 40, 370 120 C 355 180, 290 215, 240 198 C 190 180, 175 70, 210 20 Z" fill="url(#vaRad_shadow)" />
      </g>

      <rect x="0" y="0" width="360" height="220" filter="url(#vaRad_grain)" opacity="0.55" />

      <g className="vaRad_grid" opacity="0.95" stroke="#ffffff" strokeOpacity="0.55" strokeWidth="1.25" fill="none">
        <path d={ptsToD(ring(1))} />
        <path d={ptsToD(ring(0.72))} strokeOpacity="0.42" />
        <path d={ptsToD(ring(0.46))} strokeOpacity="0.28" />
        {outer.map(([x, y], idx) => (
          <line key={idx} x1={cx} y1={cy} x2={x} y2={y} strokeOpacity="0.35" />
        ))}
      </g>

      <g className="vaRad_area" filter="url(#vaRad_glow)">
        <path d={ptsToD(area)} fill="#1de9a5" fillOpacity="0.38" stroke="#ffffff" strokeOpacity="0.7" strokeWidth="1.25" />
      </g>

      <style>{`
        .vaRad_grid {
          opacity: 0;
          transform: translateY(6px);
        }
        svg[data-animate="true"] .vaRad_grid {
          animation: vaRad_gridIn 700ms ease-out both;
          animation-delay: 120ms;
        }
        @keyframes vaRad_gridIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 0.95; transform: translateY(0); }
        }

        .vaRad_area {
          transform-box: fill-box;
          transform-origin: 50% 50%;
          transform: scale(0.06);
          opacity: 0;
          will-change: transform, opacity;
        }
        svg[data-animate="true"] .vaRad_area {
          animation: vaRad_pop 900ms cubic-bezier(0.22, 1, 0.36, 1) both;
          animation-delay: 180ms;
        }
        @keyframes vaRad_pop {
          0% { transform: scale(0.06); opacity: 0; }
          60% { opacity: 1; }
          80% { transform: scale(1.04); }
          100% { transform: scale(1); opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          .vaRad_grid, .vaRad_area { animation: none !important; transform: none !important; opacity: 1 !important; }
        }
      `}</style>
    </SvgWrap>
  );
}

