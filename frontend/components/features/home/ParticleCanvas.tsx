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
  "120, 180, 255",
  "80, 140, 255",
  "160, 200, 255",
  "200, 220, 255",
  "100, 160, 255",
];

export function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: -1000, y: -1000, active: false });
  const rafRef = useRef<number>(0);
  const lastSpawnRef = useRef(0);

  const createParticle = useCallback((x: number, y: number, spread: number): Particle => {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 1.5 + 0.3;
    return {
      x: x + (Math.random() - 0.5) * spread,
      y: y + (Math.random() - 0.5) * spread,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: Math.random() * 3 + 1,
      opacity: Math.random() * 0.7 + 0.3,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      life: 0,
      maxLife: Math.random() * 80 + 40,
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = document.documentElement.scrollHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Re-measure on scroll height changes (e.g. content loads)
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(document.body);

    // Seed ambient particles across the full page
    const particles = particlesRef.current;
    for (let i = 0; i < 180; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2.5 + 0.5,
        opacity: Math.random() * 0.4 + 0.1,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        life: Math.random() * 60,
        maxLife: Math.random() * 120 + 60,
      });
    }

    // Window-level mouse/touch handlers
    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current = {
        x: e.clientX,
        y: e.clientY + window.scrollY,
        active: true,
      };
    };
    const onMouseLeave = () => {
      mouseRef.current.active = false;
    };
    const onTouchMove = (e: TouchEvent) => {
      const t = e.touches[0];
      mouseRef.current = {
        x: t.clientX,
        y: t.clientY + window.scrollY,
        active: true,
      };
    };
    const onTouchEnd = () => {
      mouseRef.current.active = false;
    };

    window.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseleave", onMouseLeave);
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchstart", onTouchMove as EventListener, { passive: true });
    window.addEventListener("touchend", onTouchEnd);

    const animate = (time: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const mouse = mouseRef.current;

      // Spawn particles near cursor
      if (mouse.active && time - lastSpawnRef.current > 16) {
        for (let i = 0; i < 3; i++) {
          particles.push(createParticle(mouse.x, mouse.y, 60));
        }
        lastSpawnRef.current = time;
      }

      // Update and draw
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life++;

        if (p.life > p.maxLife) {
          if (particles.length < 400) {
            p.x = Math.random() * canvas.width;
            p.y = Math.random() * canvas.height;
            p.life = 0;
            p.maxLife = Math.random() * 120 + 60;
            p.opacity = Math.random() * 0.4 + 0.1;
          } else {
            particles.splice(i, 1);
            continue;
          }
        }

        // Mouse attraction
        if (mouse.active) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 200 && dist > 1) {
            const force = 0.02 * (1 - dist / 200);
            p.vx += (dx / dist) * force;
            p.vy += (dy / dist) * force;
          }
        }

        // Drift
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.99;
        p.vy *= 0.99;

        // Fade based on life
        const lifeRatio = p.life / p.maxLife;
        const alpha = lifeRatio < 0.1
          ? p.opacity * (lifeRatio / 0.1)
          : lifeRatio > 0.7
            ? p.opacity * (1 - (lifeRatio - 0.7) / 0.3)
            : p.opacity;

        // Draw glow
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color}, ${alpha * 0.15})`;
        ctx.fill();

        // Draw core
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color}, ${alpha})`;
        ctx.fill();
      }

      // Draw connections near cursor
      if (mouse.active) {
        for (let i = 0; i < particles.length; i++) {
          const a = particles[i];
          const dxM = a.x - mouse.x;
          const dyM = a.y - mouse.y;
          const distM = Math.sqrt(dxM * dxM + dyM * dyM);
          if (distM > 150) continue;

          for (let j = i + 1; j < particles.length; j++) {
            const b = particles[j];
            const dx = a.x - b.x;
            const dy = a.y - b.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 80) {
              const lineAlpha = 0.15 * (1 - dist / 80) * (1 - distM / 150);
              ctx.beginPath();
              ctx.moveTo(a.x, a.y);
              ctx.lineTo(b.x, b.y);
              ctx.strokeStyle = `rgba(120, 180, 255, ${lineAlpha})`;
              ctx.lineWidth = 0.5;
              ctx.stroke();
            }
          }
        }
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchstart", onTouchMove as EventListener);
      window.removeEventListener("touchend", onTouchEnd);
      resizeObserver.disconnect();
      cancelAnimationFrame(rafRef.current);
      particlesRef.current = [];
    };
  }, [createParticle]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute top-0 left-0 w-full"
      style={{ zIndex: 20 }}
    />
  );
}
