"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { BufferAttribute } from "three";

interface Props {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [textVisible, setTextVisible] = useState(false);
  const [hintVisible, setHintVisible] = useState(false);
  const [exiting, setExiting] = useState(false);
  const completedRef = useRef(false);

  function dismiss() {
    if (completedRef.current) return;
    completedRef.current = true;
    setExiting(true);
    setTimeout(onComplete, 600);
  }

  useEffect(() => {
    // Reduced-motion fallback
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setTextVisible(true);
      setTimeout(dismiss, 1200);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    let animId: number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let renderer: any;

    (async () => {
      const THREE = await import("three");

      // ── Scene setup ──────────────────────────────────────────────
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setClearColor(0x000000, 1);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
      camera.position.z = 5;

      // ── Particle count & buffers ─────────────────────────────────
      const COUNT = 6000;
      const positions = new Float32Array(COUNT * 3);
      const colors = new Float32Array(COUNT * 3);
      const startPos = new Float32Array(COUNT * 3);
      const targetPos = new Float32Array(COUNT * 3);
      const phases = new Float32Array(COUNT);

      // Build target positions — a chef-hat-on-plate silhouette
      function buildTargets() {
        const pts: [number, number, number][] = [];

        // Outer circle (the plate/brim) — 1800 pts
        for (let i = 0; i < 1800; i++) {
          const angle = (i / 1800) * Math.PI * 2;
          const r = 1.8 + (Math.random() - 0.5) * 0.08;
          pts.push([Math.cos(angle) * r, Math.sin(angle) * r * 0.18 - 1.5, (Math.random() - 0.5) * 0.05]);
        }

        // Hat body — dome shape — 2500 pts
        for (let i = 0; i < 2500; i++) {
          const phi = Math.random() * Math.PI; // 0 to π
          const theta = Math.random() * Math.PI * 2;
          const scale = 0.9 + Math.random() * 0.05;
          // Cap to upper hemisphere only, squash for chef-hat dome shape
          const x = Math.sin(phi) * Math.cos(theta) * scale * 1.1;
          const y = Math.abs(Math.cos(phi)) * scale * 1.4 + 0.1;
          const z = Math.sin(phi) * Math.sin(theta) * scale * 0.3;
          pts.push([x, y, z]);
        }

        // Flame wisps (left of hat base) — 900 pts
        for (let i = 0; i < 900; i++) {
          const t = Math.random();
          const flame = Math.pow(t, 0.5);
          const spread = (1 - flame) * 0.6;
          const x = -1.3 - spread * Math.random() + Math.random() * 0.2;
          const y = -1.2 + flame * 1.5 + (Math.random() - 0.5) * 0.3;
          const z = (Math.random() - 0.5) * 0.2;
          pts.push([x, y, z]);
        }

        // Center bright core — 800 pts
        for (let i = 0; i < 800; i++) {
          const r = Math.random() * 0.35;
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.random() * Math.PI;
          pts.push([Math.sin(phi) * Math.cos(theta) * r, Math.sin(phi) * Math.sin(theta) * r + 0.2, Math.cos(phi) * r * 0.3]);
        }

        return pts;
      }

      const targets = buildTargets();

      for (let i = 0; i < COUNT; i++) {
        // Start: exploded sphere around camera
        const phi = Math.random() * Math.PI;
        const theta = Math.random() * Math.PI * 2;
        const radius = 5 + Math.random() * 5;
        startPos[i * 3] = Math.sin(phi) * Math.cos(theta) * radius;
        startPos[i * 3 + 1] = Math.sin(phi) * Math.sin(theta) * radius;
        startPos[i * 3 + 2] = Math.cos(phi) * radius;

        // Target: sampled from our silhouette
        const t = targets[i % targets.length];
        targetPos[i * 3] = t[0];
        targetPos[i * 3 + 1] = t[1];
        targetPos[i * 3 + 2] = t[2];

        positions[i * 3] = startPos[i * 3];
        positions[i * 3 + 1] = startPos[i * 3 + 1];
        positions[i * 3 + 2] = startPos[i * 3 + 2];

        // Flame color: red (#DC1A17) → orange (#F97316)
        const mix = Math.random();
        colors[i * 3] = 0.86 + mix * (0.98 - 0.86);     // R
        colors[i * 3 + 1] = 0.1 + mix * (0.45 - 0.1);   // G
        colors[i * 3 + 2] = 0.09 + mix * (0.086 - 0.09); // B

        phases[i] = Math.random() * Math.PI * 2;
      }

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

      // Additive blending soft-circle particle
      const material = new THREE.PointsMaterial({
        size: 0.025,
        vertexColors: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        transparent: true,
        opacity: 0.9,
        sizeAttenuation: true,
      });

      const particles = new THREE.Points(geometry, material);
      scene.add(particles);

      // ── Timing ───────────────────────────────────────────────────
      const GATHER_START = 0.4;   // s
      const GATHER_END = 2.0;     // s
      const TEXT_TIME = 2.6;      // s
      const HINT_TIME = 2.8;      // s
      const AUTO_DISMISS = 4.5;   // s

      let textShown = false;
      let hintShown = false;
      let startTime: number | null = null;

      // easing
      function easeInOutCubic(t: number) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      }
      function easeOutQuart(t: number) {
        return 1 - Math.pow(1 - t, 4);
      }

      const handleResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      };
      window.addEventListener("resize", handleResize);

      // ── Render loop ───────────────────────────────────────────────
      function animate(time: number) {
        animId = requestAnimationFrame(animate);
        if (!startTime) startTime = time;
        const elapsed = (time - startTime) / 1000;

        // Gather progress 0→1
        const gatherT = Math.min(1, Math.max(0, (elapsed - GATHER_START) / (GATHER_END - GATHER_START)));
        const easedGather = easeOutQuart(gatherT);

        const posAttr = geometry.getAttribute("position") as BufferAttribute;

        for (let i = 0; i < COUNT; i++) {
          const sx = startPos[i * 3], sy = startPos[i * 3 + 1], sz = startPos[i * 3 + 2];
          const tx = targetPos[i * 3], ty = targetPos[i * 3 + 1], tz = targetPos[i * 3 + 2];

          // Breathing after formation
          const breathAmp = gatherT > 0.98 ? 0.012 : 0;
          const breath = Math.sin(elapsed * 1.2 + phases[i]) * breathAmp;

          posAttr.setXYZ(
            i,
            sx + (tx - sx) * easedGather + tx * breath,
            sy + (ty - sy) * easedGather + ty * breath,
            sz + (tz - sz) * easedGather + tz * breath
          );
        }
        posAttr.needsUpdate = true;

        // Slow rotation
        particles.rotation.y = elapsed * 0.08;
        particles.rotation.x = Math.sin(elapsed * 0.15) * 0.04;

        if (!textShown && elapsed > TEXT_TIME) {
          textShown = true;
          setTextVisible(true);
        }
        if (!hintShown && elapsed > HINT_TIME) {
          hintShown = true;
          setHintVisible(true);
        }
        if (elapsed > AUTO_DISMISS && !completedRef.current) {
          dismiss();
        }

        renderer.render(scene, camera);
      }

      animId = requestAnimationFrame(animate);

      return () => {
        cancelAnimationFrame(animId);
        window.removeEventListener("resize", handleResize);
        geometry.dispose();
        material.dispose();
        renderer.dispose();
      };
    })();

    return () => {
      cancelAnimationFrame(animId!);
      renderer?.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className={`fixed inset-0 z-[100] bg-black flex items-center justify-center transition-opacity duration-500 ${exiting ? "opacity-0" : "opacity-100"}`}
      onClick={dismiss}
    >
      {/* Three.js canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* Radial glow underneath text */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 60% 50% at 50% 55%, rgba(220,26,23,0.08) 0%, transparent 70%)" }} />

      {/* Text overlay */}
      <div className={`relative z-10 text-center flex flex-col items-center pointer-events-none transition-all duration-700 ${textVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
        <Image
          src="/logo.jpeg"
          alt="Kooqs"
          width={90}
          height={90}
          className="rounded-full border-2 border-kooqs-red/40 shadow-2xl mb-5"
          priority
        />
        <h1 className="text-5xl sm:text-6xl font-black tracking-tight">
          <span className="text-white">Kooqs</span>
          <span className="text-gradient-flame">.Takeout</span>
        </h1>
        <p className="text-kooqs-text-dim text-lg mt-2 font-medium tracking-widest uppercase text-sm">
          Fresh · Fast · Flavorful
        </p>
        <p className="text-kooqs-text-dim text-xs mt-1">055 090 7888 / 055 470 4380</p>
      </div>

      {/* Skip hint */}
      <div className={`absolute bottom-10 left-0 right-0 flex justify-center transition-all duration-500 ${hintVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}>
        <span className="text-kooqs-text-dim text-xs tracking-widest uppercase animate-pulse">
          Tap anywhere to enter →
        </span>
      </div>
    </div>
  );
}
