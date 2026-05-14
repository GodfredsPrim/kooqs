"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Package, Search, Loader2, Phone } from "lucide-react";
import Navbar from "@/components/Navbar";

export default function TrackOrderPage() {
  const router = useRouter();
  const [orderNumber, setOrderNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleTrack(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = orderNumber.trim();
    if (!trimmed) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(trimmed)}`);
      if (!res.ok) {
        setError("We couldn't find that order. Double-check your order number and try again.");
        setLoading(false);
        return;
      }
      router.push(`/order/${encodeURIComponent(trimmed)}`);
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-kooqs-dark">
      <Navbar />
      <main className="flex flex-col items-center justify-center px-4 py-20">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex flex-col items-center mb-10">
            <Image src="/logo.jpeg" alt="Kooqs" width={72} height={72} className="rounded-full border-2 border-kooqs-red/40 shadow-xl mb-4" />
            <h1 className="text-white font-black text-3xl text-center">Track Your Order</h1>
            <p className="text-kooqs-text-dim text-sm mt-2 text-center">Enter your order number to see the latest status</p>
          </div>

          {/* Search card */}
          <div className="card p-6">
            <form onSubmit={handleTrack} className="space-y-4">
              <div>
                <label className="text-kooqs-text-dim text-sm font-medium block mb-1.5 flex items-center gap-1.5">
                  <Package size={14} className="text-kooqs-red" /> Order Number
                </label>
                <input
                  type="text"
                  value={orderNumber}
                  onChange={(e) => { setOrderNumber(e.target.value); setError(""); }}
                  placeholder="e.g. KOOQS-001"
                  className="input"
                  autoFocus
                />
              </div>

              {error && (
                <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading || !orderNumber.trim()}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {loading ? (
                  <><Loader2 size={16} className="animate-spin" /> Searching...</>
                ) : (
                  <><Search size={16} /> Track Order</>
                )}
              </button>
            </form>

            <div className="mt-5 pt-5 border-t border-kooqs-border text-center">
              <p className="text-kooqs-text-dim text-xs mb-1">Need help? Call us</p>
              <a
                href={`tel:${(process.env.NEXT_PUBLIC_RESTAURANT_PHONE ?? "").split("/")[0].trim()}`}
                className="flex items-center justify-center gap-1.5 text-kooqs-orange font-semibold text-sm hover:underline"
              >
                <Phone size={13} />
                {process.env.NEXT_PUBLIC_RESTAURANT_PHONE ?? "055 090 7888"}
              </a>
            </div>
          </div>

          <p className="text-kooqs-text-dim text-xs text-center mt-6">
            Your order number was shown on the confirmation page after you placed your order.
          </p>

          <div className="flex justify-center mt-6">
            <Link href="/" className="text-kooqs-text-dim text-sm hover:text-white transition-colors">
              ← Back to menu
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
