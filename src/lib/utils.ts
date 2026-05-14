import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number): string {
  return `GhC ${Math.round(amount)}`;
}

export function generateOrderNumber(sequence: number): string {
  return `KOOQS-${String(sequence).padStart(3, "0")}`;
}

export const ORDER_STATUSES = [
  { value: "pending", label: "Pending", color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20" },
  { value: "confirmed", label: "Confirmed", color: "text-blue-400 bg-blue-400/10 border-blue-400/20" },
  { value: "preparing", label: "Preparing", color: "text-orange-400 bg-orange-400/10 border-orange-400/20" },
  { value: "ready", label: "Ready", color: "text-green-400 bg-green-400/10 border-green-400/20" },
  { value: "out_for_delivery", label: "Out for Delivery", color: "text-purple-400 bg-purple-400/10 border-purple-400/20" },
  { value: "delivered", label: "Delivered", color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" },
  { value: "cancelled", label: "Cancelled", color: "text-red-400 bg-red-400/10 border-red-400/20" },
];

export function getStatusInfo(status: string) {
  return ORDER_STATUSES.find((s) => s.value === status) ?? ORDER_STATUSES[0];
}

export function getNextStatus(current: string): string | null {
  const flow = ["pending", "confirmed", "preparing", "ready", "out_for_delivery", "delivered"];
  const idx = flow.indexOf(current);
  return idx < flow.length - 1 ? flow[idx + 1] : null;
}
