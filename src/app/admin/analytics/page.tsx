"use client";

import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, PieChart, Pie, Cell, Legend } from "recharts";
import { TrendingUp, ShoppingBag, Users, DollarSign, Loader2 } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import type { AnalyticsData } from "@/types";

const STATUS_COLORS: Record<string, string> = {
  pending: "#EAB308", confirmed: "#3B82F6", preparing: "#F97316",
  ready: "#22C55E", out_for_delivery: "#A855F7", delivered: "#10B981", cancelled: "#EF4444",
};

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/analytics")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-6 mt-14 lg:mt-0 flex items-center justify-center min-h-[60vh]">
        <Loader2 size={32} className="animate-spin text-kooqs-red" />
      </div>
    );
  }

  if (!data) return <div className="p-6 text-kooqs-text-dim">Failed to load analytics.</div>;

  const stats = [
    { label: "Today's Revenue", value: formatPrice(data.todayRevenue), sub: `${data.todayOrders} orders`, icon: DollarSign, color: "text-green-400", bg: "bg-green-400/10" },
    { label: "Weekly Revenue", value: formatPrice(data.weekRevenue), sub: `${data.weekOrders} orders`, icon: TrendingUp, color: "text-kooqs-orange", bg: "bg-kooqs-orange/10" },
    { label: "Monthly Revenue", value: formatPrice(data.monthRevenue), sub: `${data.monthOrders} orders`, icon: ShoppingBag, color: "text-blue-400", bg: "bg-blue-400/10" },
    { label: "Total Customers", value: data.totalCustomers.toString(), sub: "Unique emails", icon: Users, color: "text-purple-400", bg: "bg-purple-400/10" },
  ];

  const pieData = data.ordersByStatus.filter((s) => s.count > 0).map((s) => ({
    name: s.status.replace(/_/g, " "), value: s.count, color: STATUS_COLORS[s.status] ?? "#888",
  }));

  return (
    <div className="p-4 sm:p-6 lg:p-8 mt-14 lg:mt-0">
      <div className="mb-8">
        <h1 className="text-kooqs-text font-black text-2xl sm:text-3xl">Analytics</h1>
        <p className="text-kooqs-text-dim text-sm mt-1">Restaurant performance overview</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="card p-5">
            <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center mb-3`}>
              <stat.icon size={20} className={stat.color} />
            </div>
            <p className="text-kooqs-text font-black text-xl">{stat.value}</p>
            <p className="text-kooqs-text-dim text-xs mt-0.5">{stat.label}</p>
            <p className="text-kooqs-text-dim text-xs">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Revenue over 7 days */}
      <div className="card p-5 mb-6">
        <h2 className="text-kooqs-text font-bold text-lg mb-1">Revenue Trend (Last 7 Days)</h2>
        <p className="text-kooqs-text-dim text-xs mb-5">Daily revenue with order count overlay</p>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={data.revenueByDay} margin={{ left: 0, right: 16 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border-color))" />
            <XAxis dataKey="date" stroke="var(--chart-axis)" tick={{ fill: "var(--chart-tick)", fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis stroke="var(--chart-axis)" tick={{ fill: "var(--chart-tick)", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `GhC ${v}`} />
            <Tooltip
              contentStyle={{ background: "rgb(var(--bg-card))", border: "1px solid rgb(var(--border-color))", borderRadius: "8px", color: "rgb(var(--text-primary))" }}
              formatter={(value, name) => [name === "revenue" ? formatPrice(value as number) : value, name === "revenue" ? "Revenue" : "Orders"]}
            />
            <Line type="monotone" dataKey="revenue" stroke="#DC1A17" strokeWidth={2.5} dot={{ fill: "#DC1A17", r: 4 }} activeDot={{ r: 6 }} />
            <Line type="monotone" dataKey="orders" stroke="#F97316" strokeWidth={2} strokeDasharray="4 4" dot={false} />
            <Legend formatter={(v) => <span style={{ color: "rgb(var(--text-dim))", fontSize: 12 }}>{v === "revenue" ? "Revenue (GhC)" : "Orders"}</span>} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Top items */}
        <div className="card p-5">
          <h2 className="text-kooqs-text font-bold text-lg mb-1">Top Selling Items</h2>
          <p className="text-kooqs-text-dim text-xs mb-5">By quantity sold (last 30 days)</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.topItems.slice(0, 6)} layout="vertical" margin={{ left: 0, right: 16 }}>
              <XAxis type="number" stroke="var(--chart-axis)" tick={{ fill: "var(--chart-tick)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" stroke="var(--chart-axis)" tick={{ fill: "var(--chart-tick)", fontSize: 11 }} width={120} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: "rgb(var(--bg-card))", border: "1px solid rgb(var(--border-color))", borderRadius: "8px", color: "rgb(var(--text-primary))" }}
                formatter={(value, name) => [value, name === "count" ? "Units Sold" : "Revenue"]}
              />
              <Bar dataKey="count" fill="url(#barGradient)" radius={[0, 4, 4, 0]} />
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#DC1A17" />
                  <stop offset="100%" stopColor="#F97316" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Status breakdown */}
        <div className="card p-5">
          <h2 className="text-kooqs-text font-bold text-lg mb-1">Order Status Breakdown</h2>
          <p className="text-kooqs-text-dim text-xs mb-3">All-time distribution</p>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="45%" innerRadius={60} outerRadius={85} paddingAngle={3} dataKey="value">
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: "rgb(var(--bg-card))", border: "1px solid rgb(var(--border-color))", borderRadius: "8px", color: "rgb(var(--text-primary))" }}
                  formatter={(value, name) => [value, String(name).replace(/_/g, " ")]}
                />
                <Legend formatter={(v) => <span style={{ color: "rgb(var(--text-dim))", fontSize: 11 }}>{v}</span>} iconSize={8} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48 text-kooqs-text-dim text-sm">No data yet</div>
          )}
        </div>
      </div>

      {/* Revenue per item table */}
      <div className="card">
        <div className="p-5 border-b border-kooqs-border">
          <h2 className="text-kooqs-text font-bold text-lg">Top Items Revenue</h2>
        </div>
        <div className="divide-y divide-kooqs-border">
          {data.topItems.map((item, i) => (
            <div key={item.name} className="flex items-center gap-4 p-4">
              <span className="text-kooqs-text-dim text-sm w-6 text-center font-bold">#{i + 1}</span>
              <div className="flex-1">
                <p className="text-kooqs-text font-medium text-sm">{item.name}</p>
                <p className="text-kooqs-text-dim text-xs">{item.count} units sold</p>
              </div>
              <span className="text-kooqs-red font-bold text-sm">{formatPrice(item.revenue)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
