"use client";

import { useState, useEffect, lazy, Suspense } from "react";

const SplashScreen = lazy(() => import("./SplashScreen"));

const SESSION_KEY = "kooqs_splash_shown";

export default function SplashGate({ children }: { children: React.ReactNode }) {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(SESSION_KEY)) {
        setShowSplash(false);
      }
    } catch {
      setShowSplash(false);
    }
  }, []);

  function onComplete() {
    try { sessionStorage.setItem(SESSION_KEY, "1"); } catch {}
    setShowSplash(false);
  }

  return (
    <>
      {showSplash && (
        <Suspense fallback={null}>
          <SplashScreen onComplete={onComplete} />
        </Suspense>
      )}
      {children}
    </>
  );
}
