"use client";

import { useEffect, useRef, useCallback } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  color: string;
  life: number;
  maxLife: number;
}

const COLORS = [
  "100, 180, 255",
  "60, 130, 255",
  "140, 200, 255",
  "180, 220, 255",
  "80, 160, 255",
  "200, 230, 255",
];

export function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: -1000, y: -1000, active: false });
  const rafRef = useRef<number>(0);
  const lastSpawnRef = useRef(0);

  const createParticle = useCallback((x: number, y: number, spread: number, isTrail = false): Particle => {
    const angle = Math.random() * Math.PI * 2;
    const speed = isTrail ? Math.random() * 2 + 0.5 : Math.random() * 0.4 + 0.1;
    return {
      x: x + (Math.random() - 0.5) * spread,
      y: y + (Math.random() - 0.5) * spread,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - (isTrail ? 0.3 : 0),
      size: isTrail ? Math.random() * 1.5 + 0.5 : Math.random() * 1.2 + 0.4,
      opacity: isTrail ? Math.random() * 0.8 + 0.4 : Math.random() * 0.5 + 0.15,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      life: 0,
      maxLife: isTrail ? Math.random() * 60 + 30 : Math.random() * 200 + 100,
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
    for (let i = 0; i < 40; i++) {
      particles.push(createParticle(
        Math.random() * canvas.width,
        Math.random() * canvas.height,
        0,
      ));
    }

    // Local mouse/touch handlers relative to canvas
    const getLocalCoords = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      return { x: clientX - rect.left, y: clientY - rect.top };
    };

    const onMouseMove = (e: MouseEvent) => {
      const pos = getLocalCoords(e.clientX, e.clientY);
      mouseRef.current = { ...pos, active: true };
    };
    const onMouseLeave = () => { mouseRef.current.active = false; };
    const onTouchMove = (e: TouchEvent) => {
      const t = e.touches[0];
      const pos = getLocalCoords(t.clientX, t.clientY);
      mouseRef.current = { ...pos, active: true };
    };
    const onTouchEnd = () => { mouseRef.current.active = false; };

    parent.addEventListener("mousemove", onMouseMove);
    parent.addEventListener("mouseleave", onMouseLeave);
    parent.addEventListener("touchmove", onTouchMove, { passive: true });
    parent.addEventListener("touchstart", onTouchMove as EventListener, { passive: true });
    parent.addEventListener("touchend", onTouchEnd);

    const CONNECTION_DIST = 120;
    const MOUSE_RADIUS = 220;

    const animate = (time: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const mouse = mouseRef.current;
      const w = canvas.width;
      const h = canvas.height;

      // Spawn trail particles near cursor
      if (mouse.active && time - lastSpawnRef.current > 50) {
        for (let i = 0; i < 2; i++) {
          particles.push(createParticle(mouse.x, mouse.y, 40, true));
        }
        lastSpawnRef.current = time;
      }

      // Update particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life++;

        if (p.life > p.maxLife) {
          if (particles.length < 150) {
            // Respawn as ambient
            p.x = Math.random() * w;
            p.y = Math.random() * h;
            p.vx = (Math.random() - 0.5) * 0.3;
            p.vy = (Math.random() - 0.5) * 0.3;
            p.life = 0;
            p.maxLife = Math.random() * 200 + 100;
            p.opacity = Math.random() * 0.5 + 0.15;
            p.size = Math.random() * 1.2 + 0.4;
          } else {
            particles.splice(i, 1);
            continue;
          }
        }

        // Mouse interaction: attract + push
        if (mouse.active) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MOUSE_RADIUS && dist > 1) {
            const norm = 1 - dist / MOUSE_RADIUS;
            // Gentle orbit: attract + perpendicular push
            const force = 0.025 * norm;
            p.vx += (dx / dist) * force + (-dy / dist) * force * 0.5;
            p.vy += (dy / dist) * force + (dx / dist) * force * 0.5;
          }
        }

        // Drift
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.985;
        p.vy *= 0.985;

        // Wrap around edges
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        if (p.y < -10) p.y = h + 10;
        if (p.y > h + 10) p.y = -10;
      }

      // -- Draw connections (always, not just near cursor) --
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i];
        const lifeRatioA = a.life / a.maxLife;
        const alphaA = lifeRatioA < 0.1 ? lifeRatioA / 0.1 : lifeRatioA > 0.8 ? (1 - (lifeRatioA - 0.8) / 0.2) : 1;

        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < CONNECTION_DIST) {
            const lifeRatioB = b.life / b.maxLife;
            const alphaB = lifeRatioB < 0.1 ? lifeRatioB / 0.1 : lifeRatioB > 0.8 ? (1 - (lifeRatioB - 0.8) / 0.2) : 1;
            const proximity = 1 - dist / CONNECTION_DIST;

            // Brighter lines near cursor
            let boost = 0;
            if (mouse.active) {
              const midX = (a.x + b.x) / 2;
              const midY = (a.y + b.y) / 2;
              const dMouse = Math.sqrt((midX - mouse.x) ** 2 + (midY - mouse.y) ** 2);
              if (dMouse < MOUSE_RADIUS) {
                boost = 0.25 * (1 - dMouse / MOUSE_RADIUS);
              }
            }

            const lineAlpha = (0.08 + boost) * proximity * Math.min(alphaA, alphaB);
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(120, 190, 255, ${lineAlpha})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      // -- Draw particles --
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const lifeRatio = p.life / p.maxLife;
        const alpha = lifeRatio < 0.1
          ? p.opacity * (lifeRatio / 0.1)
          : lifeRatio > 0.75
            ? p.opacity * (1 - (lifeRatio - 0.75) / 0.25)
            : p.opacity;

        // Outer glow
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 4);
        grad.addColorStop(0, `rgba(${p.color}, ${alpha * 0.4})`);
        grad.addColorStop(1, `rgba(${p.color}, 0)`);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        // Core dot
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color}, ${alpha})`;
        ctx.fill();
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
      resizeObs.disconnect();
      cancelAnimationFrame(rafRef.current);
      particlesRef.current = [];
    };
  }, [createParticle]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-[2] w-full h-full"
    />
  );
}
