"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { ShoppingCart, MapPin, Phone, Package, Download, Sun, Moon, Monitor, Share, X } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useTheme } from "@/context/ThemeContext";
import { usePWAInstall } from "@/hooks/usePWAInstall";

type ThemeOption = "system" | "light" | "dark";

const THEME_OPTIONS: { value: ThemeOption; label: string; icon: typeof Sun }[] = [
  { value: "system", label: "System", icon: Monitor },
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
];

export default function Navbar() {
  const { itemCount, toggleCart } = useCart();
  const { theme, setTheme } = useTheme();
  const { canInstall, isIOS, isStandalone, install, showIOSInstructions, dismissIOSInstructions } = usePWAInstall();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const currentIcon = THEME_OPTIONS.find((o) => o.value === theme) ?? THEME_OPTIONS[0];

  return (
    <header className="sticky top-0 z-40 glass border-b border-kooqs-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <Image src="/logo.jpeg" alt="Kooqs" width={40} height={40} className="rounded-full" />
            <div className="hidden sm:block">
              <span className="text-kooqs-text font-black text-lg tracking-tight">Kooqs</span>
              <span className="text-gradient-flame font-black text-lg">.Takeout</span>
            </div>
          </Link>

          {/* Center info */}
          <div className="hidden md:flex items-center gap-6 text-xs text-kooqs-text-dim">
            <div className="flex items-center gap-1.5">
              <MapPin size={13} className="text-kooqs-red" />
              <span>{process.env.NEXT_PUBLIC_RESTAURANT_ADDRESS ?? "123 Flavor Street"}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Phone size={13} className="text-kooqs-red" />
              <span>{process.env.NEXT_PUBLIC_RESTAURANT_PHONE ?? "+1 (555) 123-4567"}</span>
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Install PWA */}
            {!isStandalone && (canInstall || isIOS) && (
              <button
                onClick={install}
                className="flex items-center gap-1.5 bg-kooqs-card border border-kooqs-border hover:border-kooqs-red px-3 py-2 rounded-xl transition-all duration-200 group text-kooqs-text-dim hover:text-kooqs-text"
                aria-label="Install app"
              >
                <Download size={16} className="group-hover:text-kooqs-red transition-colors" />
                <span className="hidden sm:block text-sm font-semibold">Install</span>
              </button>
            )}
            {/* Theme Toggle */}
            <div className="relative" ref={ref}>
              <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-1.5 bg-kooqs-card border border-kooqs-border hover:border-kooqs-red px-2.5 py-2 rounded-xl transition-all duration-200 group"
                aria-label="Toggle theme"
              >
                <currentIcon.icon size={16} className="text-kooqs-text-dim group-hover:text-kooqs-red transition-colors" />
              </button>

              {open && (
                <div className="absolute right-0 mt-2 w-36 bg-kooqs-card border border-kooqs-border rounded-xl shadow-2xl overflow-hidden z-50 animate-fade-in">
                  {THEME_OPTIONS.map((opt) => {
                    const Icon = opt.icon;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => { setTheme(opt.value); setOpen(false); }}
                        className={`flex items-center gap-2.5 w-full px-4 py-2.5 text-sm transition-colors ${
                          theme === opt.value
                            ? "text-kooqs-red bg-kooqs-red/5 font-semibold"
                            : "text-kooqs-text-dim hover:text-kooqs-text hover:bg-kooqs-muted"
                        }`}
                      >
                        <Icon size={15} />
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Track Order */}
            <Link
              href="/track"
              className="flex items-center gap-1.5 bg-kooqs-card border border-kooqs-border hover:border-kooqs-red px-3 py-2 rounded-xl transition-all duration-200 group text-kooqs-text-dim hover:text-kooqs-text"
            >
              <Package size={16} className="group-hover:text-kooqs-red transition-colors" />
              <span className="hidden sm:block text-sm font-semibold">Track Order</span>
            </Link>

            {/* Cart */}
            <button
              onClick={toggleCart}
              className="relative flex items-center gap-2 bg-kooqs-card border border-kooqs-border hover:border-kooqs-red px-4 py-2 rounded-xl transition-all duration-200 group"
            >
              <ShoppingCart size={18} className="text-kooqs-text group-hover:text-kooqs-red transition-colors" />
              <span className="text-kooqs-text font-semibold text-sm hidden sm:block">Cart</span>
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-flame text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {itemCount > 9 ? "9+" : itemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
      {/* iOS install instructions modal */}
      {showIOSInstructions && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={dismissIOSInstructions}
        >
          <div
            className="card p-6 max-w-sm w-full animate-in slide-in-from-bottom-4 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-kooqs-text font-bold text-lg">Install Kooqs</h3>
              <button onClick={dismissIOSInstructions} className="text-kooqs-text-dim hover:text-kooqs-text p-1">
                <X size={18} />
              </button>
            </div>
            <ol className="space-y-3 text-kooqs-text-dim text-sm">
              <li className="flex items-start gap-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-kooqs-red/10 text-kooqs-red font-bold text-xs flex-shrink-0 mt-0.5">1</span>
                <span>Tap the <strong className="text-kooqs-text">Share</strong> icon <Share size={14} className="inline" /> in the Safari toolbar</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-kooqs-red/10 text-kooqs-red font-bold text-xs flex-shrink-0 mt-0.5">2</span>
                <span>Scroll down and tap <strong className="text-kooqs-text">Add to Home Screen</strong></span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-kooqs-red/10 text-kooqs-red font-bold text-xs flex-shrink-0 mt-0.5">3</span>
                <span>Tap <strong className="text-kooqs-text">Add</strong> in the top-right corner</span>
              </li>
            </ol>
            <button onClick={dismissIOSInstructions} className="btn-primary w-full mt-6">
              Got it
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
