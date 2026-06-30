"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { formatPrice } from "@/lib/utils";

const MTN_NUMBER = process.env.NEXT_PUBLIC_MOMO_MTN_NUMBER ?? "";
const MTN_NAME = process.env.NEXT_PUBLIC_MOMO_MTN_NAME ?? "Kooqs Takeout";
const VODAFONE_NUMBER = process.env.NEXT_PUBLIC_MOMO_VODAFONE_NUMBER ?? "";
const AIRTELTIGO_NUMBER = process.env.NEXT_PUBLIC_MOMO_AIRTELTIGO_NUMBER ?? "";
const INSTRUCTIONS =
  process.env.NEXT_PUBLIC_MOMO_INSTRUCTIONS ??
  "Send the exact total to the number above. Use your name as the reference. We will call to confirm before preparing your order.";

interface Network {
  badge: string;
  label: string;
  number: string;
  color: string;
}

const NETWORKS: Network[] = [
  { badge: "🟡", label: "MTN MoMo", number: MTN_NUMBER, color: "border-yellow-500/30 bg-yellow-500/5" },
  { badge: "🔴", label: "Vodafone Cash", number: VODAFONE_NUMBER, color: "border-red-500/30 bg-red-500/5" },
  { badge: "🔵", label: "AirtelTigo Money", number: AIRTELTIGO_NUMBER, color: "border-blue-500/30 bg-blue-500/5" },
].filter((n) => n.number.trim() !== "");

export default function MomoPaymentInstructions({ total }: { total: number }) {
  const [copied, setCopied] = useState<string | null>(null);

  if (NETWORKS.length === 0) return null;

  async function copyNumber(number: string) {
    try {
      await navigator.clipboard.writeText(number);
      setCopied(number);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      /* clipboard not available */
    }
  }

  return (
    <div className="card p-5">
      <h2 className="text-kooqs-text font-bold text-lg mb-1">Payment — Mobile Money</h2>
      <p className="text-kooqs-text-dim text-xs mb-4">
        Send <span className="text-kooqs-red font-bold">{formatPrice(total)}</span> to any number below
      </p>

      <div className="space-y-3">
        {NETWORKS.map((net) => (
          <div
            key={net.label}
            className={`flex items-center justify-between gap-3 rounded-xl border p-3 ${net.color}`}
          >
            <div className="flex items-center gap-2">
              <span className="text-xl leading-none">{net.badge}</span>
              <div>
                <p className="text-kooqs-text text-xs font-semibold">{net.label}</p>
                <p className="text-kooqs-text-dim text-[11px]">{MTN_NAME}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-kooqs-text font-mono font-bold text-sm">{net.number}</span>
              <button
                type="button"
                onClick={() => copyNumber(net.number)}
                className="p-1.5 rounded-lg bg-kooqs-muted hover:bg-kooqs-border transition-colors text-kooqs-text-dim hover:text-kooqs-text"
                title="Copy number"
              >
                {copied === net.number ? <Check size={13} className="text-green-400" /> : <Copy size={13} />}
              </button>
            </div>
          </div>
        ))}
      </div>

      <p className="text-kooqs-text-dim text-xs mt-4 leading-relaxed">{INSTRUCTIONS}</p>
    </div>
  );
}
