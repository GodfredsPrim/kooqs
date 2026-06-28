import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { formatPrice } from "@/lib/utils";
import { format } from "date-fns";
import { Users, ShoppingBag, DollarSign } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CustomersPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/login");

  const orders = await prisma.order.findMany({
    where: { status: { not: "cancelled" } },
    select: { customerName: true, phone: true, total: true, createdAt: true, orderType: true },
    orderBy: { createdAt: "desc" },
  });

  const customerMap = new Map<string, {
    name: string; phone: string;
    orderCount: number; totalSpent: number; lastOrder: Date;
  }>();

  for (const o of orders) {
    const existing = customerMap.get(o.phone);
    if (existing) {
      existing.orderCount += 1;
      existing.totalSpent += o.total;
      if (o.createdAt > existing.lastOrder) existing.lastOrder = o.createdAt;
    } else {
      customerMap.set(o.phone, {
        name: o.customerName, phone: o.phone,
        orderCount: 1, totalSpent: o.total, lastOrder: o.createdAt,
      });
    }
  }

  const customers = Array.from(customerMap.values()).sort((a, b) => b.totalSpent - a.totalSpent);
  const totalRevenue = customers.reduce((s, c) => s + c.totalSpent, 0);
  const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

  return (
    <div className="p-4 sm:p-6 lg:p-8 mt-14 lg:mt-0">
      <div className="mb-8">
        <h1 className="text-kooqs-text font-black text-2xl sm:text-3xl">Customers</h1>
        <p className="text-kooqs-text-dim text-sm mt-1">{customers.length} unique customers</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users size={16} className="text-blue-400" />
            <span className="text-kooqs-text-dim text-xs">Total Customers</span>
          </div>
          <p className="text-kooqs-text font-black text-2xl">{customers.length}</p>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign size={16} className="text-green-400" />
            <span className="text-kooqs-text-dim text-xs">Total Revenue</span>
          </div>
          <p className="text-kooqs-text font-black text-2xl">{formatPrice(totalRevenue)}</p>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-2">
            <ShoppingBag size={16} className="text-kooqs-orange" />
            <span className="text-kooqs-text-dim text-xs">Avg Order Value</span>
          </div>
          <p className="text-kooqs-text font-black text-2xl">{formatPrice(avgOrderValue)}</p>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-kooqs-border">
                <th className="text-left text-kooqs-text-dim text-xs font-semibold px-5 py-3">Customer</th>
                <th className="text-left text-kooqs-text-dim text-xs font-semibold px-5 py-3 hidden sm:table-cell">Phone</th>
                <th className="text-center text-kooqs-text-dim text-xs font-semibold px-5 py-3">Orders</th>
                <th className="text-right text-kooqs-text-dim text-xs font-semibold px-5 py-3">Total Spent</th>
                <th className="text-right text-kooqs-text-dim text-xs font-semibold px-5 py-3 hidden md:table-cell">Last Order</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-kooqs-border">
              {customers.map((customer, i) => (
                <tr key={customer.phone} className="hover:bg-kooqs-muted/30 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-flame rounded-full flex items-center justify-center text-kooqs-text font-bold text-sm flex-shrink-0">
                        {customer.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-kooqs-text font-medium text-sm">{customer.name}</p>
                        <p className="text-kooqs-text-dim text-xs">{customer.phone}</p>
                      </div>
                      {i < 3 && (
                        <span className="text-xs bg-kooqs-red/10 text-kooqs-red border border-kooqs-red/20 px-1.5 py-0.5 rounded-full font-bold">
                          Top
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3 text-kooqs-text-dim text-sm hidden sm:table-cell">{customer.phone}</td>
                  <td className="px-5 py-3 text-center">
                    <span className="text-kooqs-text font-bold text-sm">{customer.orderCount}</span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <span className="text-kooqs-red font-bold text-sm">{formatPrice(customer.totalSpent)}</span>
                  </td>
                  <td className="px-5 py-3 text-right text-kooqs-text-dim text-xs hidden md:table-cell">
                    {format(new Date(customer.lastOrder), "MMM d, yyyy")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
