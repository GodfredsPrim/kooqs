"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard, ShoppingBag, UtensilsCrossed, BarChart3,
  Users, LogOut, ChevronRight, ExternalLink,
} from "lucide-react";

const navItems = [
  { href: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/orders", icon: ShoppingBag, label: "Orders" },
  { href: "/admin/menu", icon: UtensilsCrossed, label: "Menu Management" },
  { href: "/admin/analytics", icon: BarChart3, label: "Analytics" },
  { href: "/admin/customers", icon: Users, label: "Customers" },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col fixed left-0 top-0 h-full w-64 bg-kooqs-card border-r border-kooqs-border z-30">
        {/* Logo */}
        <div className="p-5 border-b border-kooqs-border">
          <div className="flex items-center gap-3">
            <Image src="/logo.jpeg" alt="Kooqs" width={36} height={36} className="rounded-full" />
            <div>
              <p className="text-white font-black text-sm">Kooqs.Takeout</p>
              <p className="text-kooqs-text-dim text-xs">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  active
                    ? "bg-kooqs-red/10 text-white border border-kooqs-red/20"
                    : "text-kooqs-text-dim hover:text-white hover:bg-kooqs-muted"
                }`}
              >
                <item.icon size={18} className={active ? "text-kooqs-red" : "group-hover:text-kooqs-red transition-colors"} />
                <span className="flex-1">{item.label}</span>
                {active && <ChevronRight size={14} className="text-kooqs-red" />}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-kooqs-border space-y-2">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-kooqs-text-dim hover:text-white hover:bg-kooqs-muted transition-all"
          >
            <ExternalLink size={18} />
            <span>View Store</span>
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-kooqs-text-dim hover:text-red-400 hover:bg-red-500/5 transition-all"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-kooqs-card border-b border-kooqs-border">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-2">
            <Image src="/logo.jpeg" alt="Kooqs" width={28} height={28} className="rounded-full" />
            <span className="text-white font-bold text-sm">Admin</span>
          </div>
          <div className="flex gap-1 overflow-x-auto">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex-shrink-0 p-2 rounded-lg transition-colors ${
                  pathname === item.href ? "text-kooqs-red bg-kooqs-red/10" : "text-kooqs-text-dim"
                }`}
              >
                <item.icon size={18} />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
