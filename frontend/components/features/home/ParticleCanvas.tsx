"use client";

import { useEffect, useRef, useCallback } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  baseSize: number;
  opacity: number;
  color: string;
  life: number;
  maxLife: number;
  isBurst: boolean;
}

// Gold / warm white palette
const COLORS = [
  "255, 200, 60",   // gold
  "255, 180, 40",   // amber gold
  "255, 220, 100",  // light gold
  "255, 240, 180",  // warm white
  "255, 255, 220",  // soft white
  "240, 200, 80",   // deep gold
];

const LINE_COLOR = "255, 210, 80"; // gold for connections

export function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: -1000, y: -1000, active: false });
  const burstRef = useRef({ x: 0, y: 0, time: 0, strength: 1 });
  const rafRef = useRef<number>(0);
  const lastSpawnRef = useRef(0);

  const makeParticle = useCallback((
    x: number, y: number, spread: number,
    type: "ambient" | "trail" | "burst" = "ambient"
  ): Particle => {
    const angle = Math.random() * Math.PI * 2;
    const speeds = { ambient: Math.random() * 0.3 + 0.05, trail: Math.random() * 1.2 + 0.3, burst: Math.random() * 3.5 + 1.5 };
    const speed = speeds[type];
    const sizes = { ambient: Math.random() * 1 + 0.3, trail: Math.random() * 1.2 + 0.4, burst: Math.random() * 1.8 + 0.6 };
    const s = sizes[type];
    return {
      x: x + (Math.random() - 0.5) * spread,
      y: y + (Math.random() - 0.5) * spread,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: s,
      baseSize: s,
      opacity: type === "ambient" ? Math.random() * 0.4 + 0.1 : Math.random() * 0.7 + 0.3,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      life: 0,
      maxLife: type === "burst" ? Math.random() * 70 + 40 : type === "trail" ? Math.random() * 50 + 25 : Math.random() * 250 + 120,
      isBurst: type === "burst",
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const rect = parent.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };
    resize();
    window.addEventListener("resize", resize);
    const resizeObs = new ResizeObserver(resize);
    resizeObs.observe(parent);

    // Seed ambient particles
    const particles = particlesRef.current;
    for (let i = 0; i < 35; i++) {
      particles.push(makeParticle(
        Math.random() * canvas.width,
        Math.random() * canvas.height,
        0,
      ));
    }

    // Coords helper
    const getLocal = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      return { x: clientX - rect.left, y: clientY - rect.top };
    };

    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current = { ...getLocal(e.clientX, e.clientY), active: true };
    };
    const onMouseLeave = () => { mouseRef.current.active = false; };
    const onTouchMove = (e: TouchEvent) => {
      const t = e.touches[0];
      mouseRef.current = { ...getLocal(t.clientX, t.clientY), active: true };
    };
    const onTouchEnd = () => { mouseRef.current.active = false; };

    // Click/tap burst
    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
      const pos = getLocal(clientX, clientY);
      burstRef.current = { x: pos.x, y: pos.y, time: performance.now(), strength: 1 };
      // Spawn burst particles
      for (let i = 0; i < 18; i++) {
        particles.push(makeParticle(pos.x, pos.y, 10, "burst"));
      }
    };

    parent.addEventListener("mousemove", onMouseMove);
    parent.addEventListener("mouseleave", onMouseLeave);
    parent.addEventListener("touchmove", onTouchMove, { passive: true });
    parent.addEventListener("touchstart", onTouchMove as EventListener, { passive: true });
    parent.addEventListener("touchend", onTouchEnd);
    parent.addEventListener("mousedown", onPointerDown);
    parent.addEventListener("touchstart", onPointerDown as EventListener, { passive: true });

    const CONNECTION_DIST = 110;
    const MOUSE_RADIUS = 180;

    const animate = (time: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const mouse = mouseRef.current;
      const burst = burstRef.current;
      const w = canvas.width;
      const h = canvas.height;

      // Burst fade: strength goes from 1 → 0 over 1.5 seconds
      const burstAge = (time - burst.time) / 1000;
      if (burstAge < 1.5) {
        burst.strength = Math.max(0, 1 - burstAge / 1.5);
      } else {
        burst.strength = 0;
      }

      // Spawn trail particles on move
      if (mouse.active && time - lastSpawnRef.current > 60) {
        particles.push(makeParticle(mouse.x, mouse.y, 30, "trail"));
        lastSpawnRef.current = time;
      }

      // Update particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life++;

        if (p.life > p.maxLife) {
          // Burst/trail particles just die — don't respawn
          if (p.isBurst) {
            particles.splice(i, 1);
            continue;
          }
          if (particles.length < 120) {
            // Respawn ambient
            p.x = Math.random() * w;
            p.y = Math.random() * h;
            p.vx = (Math.random() - 0.5) * 0.2;
            p.vy = (Math.random() - 0.5) * 0.2;
            p.life = 0;
            p.maxLife = Math.random() * 250 + 120;
            p.opacity = Math.random() * 0.4 + 0.1;
            p.baseSize = Math.random() * 1 + 0.3;
            p.size = p.baseSize;
            p.isBurst = false;
            p.color = COLORS[Math.floor(Math.random() * COLORS.length)];
          } else {
            particles.splice(i, 1);
            continue;
          }
        }

        // Gentle pulse on size
        const pulse = 1 + Math.sin(time * 0.003 + i) * 0.15;
        p.size = p.baseSize * pulse;

        // Mouse interaction: gentle attract with swirl
        if (mouse.active) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MOUSE_RADIUS && dist > 1) {
            const norm = 1 - dist / MOUSE_RADIUS;
            const f = 0.018 * norm;
            p.vx += (dx / dist) * f + (-dy / dist) * f * 0.4;
            p.vy += (dy / dist) * f + (dx / dist) * f * 0.4;
          }
        }

        // Burst repulsion (push outward from click point while active)
        if (p.isBurst && burst.strength > 0) {
          const dx = p.x - burst.x;
          const dy = p.y - burst.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > 1 && dist < 300) {
            const push = 0.08 * burst.strength * (1 - dist / 300);
            p.vx += (dx / dist) * push;
            p.vy += (dy / dist) * push;
          }
        }

        // Physics
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.988;
        p.vy *= 0.988;

        // Wrap
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        if (p.y < -10) p.y = h + 10;
        if (p.y > h + 10) p.y = -10;
      }

      // -- Draw connections --
      ctx.lineCap = "round";
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i];
        const la = a.life / a.maxLife;
        const fadeA = la < 0.1 ? la / 0.1 : la > 0.8 ? (1 - (la - 0.8) / 0.2) : 1;

        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < CONNECTION_DIST) {
            const lb = b.life / b.maxLife;
            const fadeB = lb < 0.1 ? lb / 0.1 : lb > 0.8 ? (1 - (lb - 0.8) / 0.2) : 1;
            const prox = 1 - dist / CONNECTION_DIST;

            // Boost near cursor
            let boost = 0;
            if (mouse.active) {
              const mx = (a.x + b.x) / 2;
              const my = (a.y + b.y) / 2;
              const dm = Math.sqrt((mx - mouse.x) ** 2 + (my - mouse.y) ** 2);
              if (dm < MOUSE_RADIUS) boost = 0.2 * (1 - dm / MOUSE_RADIUS);
            }

            // Boost near burst
            if (burst.strength > 0) {
              const mx = (a.x + b.x) / 2;
              const my = (a.y + b.y) / 2;
              const db = Math.sqrt((mx - burst.x) ** 2 + (my - burst.y) ** 2);
              if (db < 250) boost += 0.35 * burst.strength * (1 - db / 250);
            }

            const lineAlpha = (0.06 + boost) * prox * Math.min(fadeA, fadeB);
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(${LINE_COLOR}, ${lineAlpha})`;
            ctx.lineWidth = Math.max(0.1, 0.5 + prox * 0.5);
            ctx.stroke();
          }
        }
      }

      // -- Draw particles --
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const lr = p.life / p.maxLife;
        const alpha = lr < 0.1
          ? p.opacity * (lr / 0.1)
          : lr > 0.75
            ? p.opacity * (1 - (lr - 0.75) / 0.25)
            : p.opacity;

        if (alpha <= 0) continue;

        const drawSize = Math.max(p.size, 0.1);

        // Soft glow
        const glowRadius = drawSize * 5;
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowRadius);
        grad.addColorStop(0, `rgba(${p.color}, ${alpha * 0.3})`);
        grad.addColorStop(0.4, `rgba(${p.color}, ${alpha * 0.08})`);
        grad.addColorStop(1, `rgba(${p.color}, 0)`);
        ctx.beginPath();
        ctx.arc(p.x, p.y, glowRadius, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        // Core
        ctx.beginPath();
        ctx.arc(p.x, p.y, drawSize, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color}, ${alpha})`;
        ctx.fill();

        // Bright center highlight
        if (drawSize > 0.6) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, drawSize * 0.4, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.6})`;
          ctx.fill();
        }
      }

      // -- Burst ring effect --
      if (burst.strength > 0) {
        const ringRadius = Math.max(0, (1 - burst.strength) * 200);
        const ringAlpha = burst.strength * 0.15;
        if (ringRadius > 0) {
          ctx.beginPath();
          ctx.arc(burst.x, burst.y, ringRadius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(255, 220, 100, ${ringAlpha})`;
          ctx.lineWidth = Math.max(0.1, 1.5 * burst.strength);
          ctx.stroke();
        }
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", resize);
      parent.removeEventListener("mousemove", onMouseMove);
      parent.removeEventListener("mouseleave", onMouseLeave);
      parent.removeEventListener("touchmove", onTouchMove);
      parent.removeEventListener("touchstart", onTouchMove as EventListener);
      parent.removeEventListener("touchend", onTouchEnd);
      parent.removeEventListener("mousedown", onPointerDown);
      resizeObs.disconnect();
      cancelAnimationFrame(rafRef.current);
      particlesRef.current = [];
    };
  }, [makeParticle]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-[2] w-full h-full"
    />
  );
}
