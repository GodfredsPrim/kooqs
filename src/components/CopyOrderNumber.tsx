"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

export default function CopyOrderNumber({ orderNumber }: { orderNumber: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(orderNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  }

  return (
    <div className="mt-4 bg-kooqs-muted rounded-xl p-4">
      <p className="text-kooqs-text-dim text-xs">Order Number</p>
      <div className="flex items-center justify-center gap-3 mt-1">
        <p className="text-kooqs-red font-black text-2xl tracking-wide">{orderNumber}</p>
        <button
          onClick={copy}
          className="p-2 rounded-lg bg-kooqs-card border border-kooqs-border hover:border-kooqs-red transition-colors text-kooqs-text-dim hover:text-kooqs-text"
          title="Copy order number"
        >
          {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
        </button>
      </div>
      {copied && <p className="text-green-400 text-xs mt-1">Copied!</p>}
    </div>
  );
}
