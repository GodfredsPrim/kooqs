"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

interface Props {
  images: string[];
}

export default function HeroSlideshow({ images }: Props) {
  const [current, setCurrent] = useState(() => Math.floor(Math.random() * Math.max(images.length, 1)));
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (images.length <= 1) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    function start() {
      timerRef.current = setInterval(() => {
        if (!document.hidden) {
          setCurrent((i) => (i + 1) % images.length);
        }
      }, 5000);
    }

    function handleVisibility() {
      if (document.hidden) {
        if (timerRef.current) clearInterval(timerRef.current);
      } else {
        start();
      }
    }

    start();
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [images.length]);

  if (!images.length) return null;

  return (
    <div className="absolute inset-0 overflow-hidden">
      {images.map((src, i) => (
        <div
          key={src}
          className="absolute inset-0 transition-opacity duration-1000"
          style={{ opacity: i === current ? 1 : 0 }}
          aria-hidden="true"
        >
          <Image
            src={src}
            alt=""
            fill
            className="object-cover scale-110"
            style={{ filter: "blur(4px) brightness(0.55)" }}
            priority={i < 2}
            sizes="100vw"
          />
        </div>
      ))}
      {/* Dark gradient overlay so text stays readable regardless of theme */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black" />
    </div>
  );
}
