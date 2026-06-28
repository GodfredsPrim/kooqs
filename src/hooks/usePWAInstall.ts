"use client";
import { useEffect, useState } from "react";

interface PWAInstallState {
  canInstall: boolean;
  isIOS: boolean;
  isStandalone: boolean;
  install: () => void;
  showIOSInstructions: boolean;
  dismissIOSInstructions: () => void;
}

export function usePWAInstall(): PWAInstallState {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [canInstall, setCanInstall] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  useEffect(() => {
    setIsIOS(/iphone|ipad|ipod/i.test(navigator.userAgent));
    setIsStandalone(
      window.matchMedia("(display-mode: standalone)").matches ||
        (navigator as { standalone?: boolean }).standalone === true
    );

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstall(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  function install() {
    if (isIOS) {
      setShowIOSInstructions(true);
      return;
    }
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    deferredPrompt.userChoice.finally(() => {
      setDeferredPrompt(null);
      setCanInstall(false);
    });
  }

  function dismissIOSInstructions() {
    setShowIOSInstructions(false);
  }

  return { canInstall, isIOS, isStandalone, install, showIOSInstructions, dismissIOSInstructions };
}
