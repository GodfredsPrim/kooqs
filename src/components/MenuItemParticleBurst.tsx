"use client";

import { useRef, useEffect, useCallback } from "react";

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  r: number;
  red: number; green: number; blue: number;
}

export function useParticleBurst() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number | null>(null);

  useEffect(() => () => { if (animRef.current) cancelAnimationFrame(animRef.current); }, []);

  const trigger = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;

    canvas.width = rect.width;
    canvas.height = rect.height;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (animRef.current) cancelAnimationFrame(animRef.current);

    const COUNT = 90;
    const particles: Particle[] = [];

    for (let i = 0; i < COUNT; i++) {
      // Fan outward — denser upward so it feels like a burst flame
      const angle = (i / COUNT) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
      const speed = 1.8 + Math.random() * 4.5;
      // Flame gradient: red (#DC1A17) → orange (#F97316)
      const mix = Math.random();
      particles.push({
        x: cx, y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        r: 2 + Math.random() * 3.5,
        red:   Math.round(220 + mix * (249 - 220)),
        green: Math.round(26  + mix * (115 - 26)),
        blue:  Math.round(23  + mix * (22  - 23)),
      });
    }

    const DURATION = 750;
    const start = performance.now();

    function draw(now: number) {
      const t = Math.min(1, (now - start) / DURATION);
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);

      for (const p of particles) {
        p.vx *= 0.96;
        p.vy *= 0.96;
        p.vy += 0.12; // slight gravity
        p.x += p.vx;
        p.y += p.vy;

        const alpha = Math.max(0, 1 - t * 1.15);
        ctx!.globalAlpha = alpha;
        ctx!.fillStyle = `rgb(${p.red},${p.green},${p.blue})`;
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.r * (1 - t * 0.45), 0, Math.PI * 2);
        ctx!.fill();
      }

      ctx!.globalAlpha = 1;

      if (t < 1) {
        animRef.current = requestAnimationFrame(draw);
      } else {
        ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
      }
    }

    animRef.current = requestAnimationFrame(draw);
  }, []);

  return { canvasRef, trigger };
}
