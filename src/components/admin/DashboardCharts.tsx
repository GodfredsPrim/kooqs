"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { format, subDays, startOfDay, endOfDay } from "date-fns";

interface Props {
  weekOrders: { total: number; createdAt: string }[];
  ordersByStatus: { status: string; count: number }[];
}

const STATUS_COLORS: Record<string, string> = {
  pending: "#EAB308",
  confirmed: "#3B82F6",
  preparing: "#F97316",
  ready: "#22C55E",
  out_for_delivery: "#A855F7",
  delivered: "#10B981",
  cancelled: "#EF4444",
};

export default function DashboardCharts({ weekOrders, ordersByStatus }: Props) {
  // Build 7-day revenue data
  const revenueData = Array.from({ length: 7 }, (_, i) => {
    const day = subDays(new Date(), 6 - i);
    const dayStart = startOfDay(day);
    const dayEnd = endOfDay(day);
    const dayTotal = weekOrders
      .filter((o) => {
        const d = new Date(o.createdAt);
        return d >= dayStart && d <= dayEnd;
      })
      .reduce((s, o) => s + o.total, 0);

    return { day: format(day, "EEE"), revenue: parseFloat(dayTotal.toFixed(2)) };
  });

  const pieData = ordersByStatus
    .filter((s) => s.count > 0)
    .map((s) => ({
      name: s.status.replace(/_/g, " "),
      value: s.count,
      color: STATUS_COLORS[s.status] ?? "#888",
    }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Revenue chart */}
      <div className="lg:col-span-2 card p-5">
        <h2 className="text-white font-bold mb-1">Revenue (Last 7 Days)</h2>
        <p className="text-kooqs-text-dim text-xs mb-5">Daily revenue in GhC</p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={revenueData} barSize={28}>
            <XAxis dataKey="day" stroke="#444" tick={{ fill: "#888", fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis stroke="#444" tick={{ fill: "#888", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `GhC ${v}`} />
            <Tooltip
              contentStyle={{ background: "#1a1a1a", border: "1px solid #333", borderRadius: "8px", color: "#fff" }}
              formatter={(value: number) => [`GhC ${Math.round(value)}`, "Revenue"]}
              cursor={{ fill: "rgba(220,26,23,0.05)" }}
            />
            <Bar dataKey="revenue" fill="url(#flameGradient)" radius={[4, 4, 0, 0]} />
            <defs>
              <linearGradient id="flameGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#DC1A17" />
                <stop offset="100%" stopColor="#F97316" />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Order status donut */}
      <div className="card p-5">
        <h2 className="text-white font-bold mb-1">Orders by Status</h2>
        <p className="text-kooqs-text-dim text-xs mb-3">All time distribution</p>
        {pieData.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="45%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                {pieData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: "#1a1a1a", border: "1px solid #333", borderRadius: "8px", color: "#fff" }}
                formatter={(value, name) => [value, String(name).replace(/_/g, " ")]}
              />
              <Legend
                formatter={(value) => <span style={{ color: "#aaa", fontSize: 11 }}>{value}</span>}
                iconSize={8}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-48 text-kooqs-text-dim text-sm">No orders yet</div>
        )}
      </div>
    </div>
  );
}
