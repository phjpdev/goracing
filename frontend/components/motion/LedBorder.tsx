"use client";

import {
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

type LedBorderProps = {
  children: ReactNode;
  className?: string;
  borderWidth?: number;
  radius?: number;
  active?: boolean;
};

function roundedRectPath(
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  const r = Math.min(radius, width / 2, height / 2);
  return [
    `M ${x + r} ${y}`,
    `H ${x + width - r}`,
    `A ${r} ${r} 0 0 1 ${x + width} ${y + r}`,
    `V ${y + height - r}`,
    `A ${r} ${r} 0 0 1 ${x + width - r} ${y + height}`,
    `H ${x + r}`,
    `A ${r} ${r} 0 0 1 ${x} ${y + height - r}`,
    `V ${y + r}`,
    `A ${r} ${r} 0 0 1 ${x + r} ${y}`,
    "Z",
  ].join(" ");
}

export function LedBorder({
  children,
  className,
  borderWidth = 2,
  radius = 12,
  active = true,
}: LedBorderProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const measurePathRef = useRef<SVGPathElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [perimeter, setPerimeter] = useState(0);

  useLayoutEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    const measure = () => {
      const { width, height } = el.getBoundingClientRect();
      setSize({ w: Math.round(width), h: Math.round(height) });
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const { w, h } = size;
  const inset = borderWidth / 2;
  const r = Math.max(0, radius - inset);
  const pathW = Math.max(0, w - borderWidth);
  const pathH = Math.max(0, h - borderWidth);
  const pathD =
    w > 0 && h > 0 ? roundedRectPath(inset, inset, pathW, pathH, r) : "";

  useLayoutEffect(() => {
    if (!measurePathRef.current) return;
    setPerimeter(measurePathRef.current.getTotalLength());
  }, [pathD, w, h]);

  const dashSegment = perimeter > 0 ? Math.max(56, perimeter * 0.14) : 0;
  const dashGap = perimeter > 0 ? perimeter - dashSegment : 0;

  const dashStyle: CSSProperties = {
    strokeDasharray: `${dashSegment} ${dashGap}`,
    ["--led-dash-total" as string]: `${perimeter}px`,
  };

  const pathProps = {
    d: pathD,
    fill: "none",
    style: dashStyle,
  };

  return (
    <div ref={rootRef} className={cn("relative overflow-visible rounded-xl", className)}>
      {active && pathD && (
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
          viewBox={`0 0 ${w} ${h}`}
          aria-hidden
        >
          {/* Hidden path used to measure perimeter before animating */}
          <path ref={measurePathRef} d={pathD} fill="none" stroke="none" />

          {perimeter > 0 && (
            <>
              <path {...pathProps} className="led-border__track--dim" />
              <path
                {...pathProps}
                className="led-border__track--heat-trail led-border__track--green"
                stroke="#28E88E"
              />
              <path
                {...pathProps}
                className="led-border__track--heat-glow led-border__track--green"
                stroke="#A7F3D0"
              />
              <path
                {...pathProps}
                className="led-border__track--heat-core led-border__track--green"
                stroke="#FFFFFF"
              />
            </>
          )}
        </svg>
      )}
      <div className="relative h-full w-full">{children}</div>
    </div>
  );
}
