import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { subDays, startOfDay, endOfDay, format } from "date-fns";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);
  const weekStart = startOfDay(subDays(now, 7));
  const monthStart = startOfDay(subDays(now, 30));

  const [todayOrders, weekOrders, monthOrders, allOrders, ordersByStatus, orderItems] =
    await Promise.all([
      prisma.order.findMany({
        where: { createdAt: { gte: todayStart, lte: todayEnd }, status: { not: "cancelled" } },
        select: { total: true },
      }),
      prisma.order.findMany({
        where: { createdAt: { gte: weekStart }, status: { not: "cancelled" } },
        select: { total: true },
      }),
      prisma.order.findMany({
        where: { createdAt: { gte: monthStart }, status: { not: "cancelled" } },
        select: { total: true },
      }),
      prisma.order.findMany({
        where: { createdAt: { gte: subDays(now, 30) } },
        select: { createdAt: true, total: true, status: true },
        orderBy: { createdAt: "asc" },
      }),
      prisma.order.groupBy({
        by: ["status"],
        _count: { status: true },
      }),
      prisma.orderItem.findMany({
        where: { order: { createdAt: { gte: monthStart }, status: { not: "cancelled" } } },
        select: { name: true, quantity: true, price: true },
      }),
    ]);

  const totalCustomers = await prisma.order.findMany({
    distinct: ["phone"],
    select: { phone: true },
  });

  const revenueByDay: { date: string; revenue: number; orders: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const day = subDays(now, i);
    const dayStart = startOfDay(day);
    const dayEnd = endOfDay(day);
    const dayOrders = allOrders.filter((o) => {
      const d = new Date(o.createdAt);
      return d >= dayStart && d <= dayEnd && o.status !== "cancelled";
    });
    revenueByDay.push({
      date: format(day, "MMM dd"),
      revenue: parseFloat(dayOrders.reduce((s, o) => s + o.total, 0).toFixed(2)),
      orders: dayOrders.length,
    });
  }

  const itemMap = new Map<string, { count: number; revenue: number }>();
  for (const item of orderItems) {
    const existing = itemMap.get(item.name) ?? { count: 0, revenue: 0 };
    itemMap.set(item.name, {
      count: existing.count + item.quantity,
      revenue: existing.revenue + item.price * item.quantity,
    });
  }

  const topItems = Array.from(itemMap.entries())
    .map(([name, data]) => ({ name, count: data.count, revenue: parseFloat(data.revenue.toFixed(2)) }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  return NextResponse.json({
    todayRevenue: parseFloat(todayOrders.reduce((s, o) => s + o.total, 0).toFixed(2)),
    todayOrders: todayOrders.length,
    weekRevenue: parseFloat(weekOrders.reduce((s, o) => s + o.total, 0).toFixed(2)),
    weekOrders: weekOrders.length,
    monthRevenue: parseFloat(monthOrders.reduce((s, o) => s + o.total, 0).toFixed(2)),
    monthOrders: monthOrders.length,
    totalCustomers: totalCustomers.length,
    revenueByDay,
    ordersByStatus: ordersByStatus.map((s) => ({ status: s.status, count: s._count.status })),
    topItems,
  });
}
