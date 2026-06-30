"use client";
import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import { usePWAInstall } from "@/hooks/usePWAInstall";

const DISMISS_KEY = "kooqs_pwa_dismissed_at";
const DISMISS_DAYS = 14;

function isDismissed() {
  try {
    const ts = localStorage.getItem(DISMISS_KEY);
    if (!ts) return false;
    return Date.now() - Number(ts) < DISMISS_DAYS * 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

function dismiss() {
  try { localStorage.setItem(DISMISS_KEY, String(Date.now())); } catch {}
}

export default function PWAInstallPrompt() {
  const { canInstall, install } = usePWAInstall();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (canInstall && !isDismissed()) {
      setVisible(true);
    }
  }, [canInstall]);

  function handleDismiss() {
    dismiss();
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 card p-4 flex items-center gap-3 shadow-2xl border border-kooqs-border animate-in slide-in-from-bottom-4 duration-300 sm:left-auto sm:right-4 sm:w-[380px]">
      <div className="w-10 h-10 rounded-xl bg-kooqs-red/10 flex items-center justify-center flex-shrink-0">
        <Download size={20} className="text-kooqs-red" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-kooqs-text font-semibold text-sm">Install Kooqs</p>
        <p className="text-kooqs-text-dim text-xs">One-tap ordering on your home screen</p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <button onClick={install} className="btn-primary text-xs px-3 py-1.5">
          Install
        </button>
        <button onClick={handleDismiss} className="text-kooqs-text-dim hover:text-kooqs-text p-1" aria-label="Dismiss">
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
