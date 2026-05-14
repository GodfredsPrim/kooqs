"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

const SplashScreen = dynamic(() => import("./SplashScreen"), { ssr: false });

export default function SplashGate({ children }: { children: React.ReactNode }) {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <>
      {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
      {children}
    </>
  );
}
