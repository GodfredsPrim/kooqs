"use client";

import { useState } from "react";
import MenuItemCard from "./MenuItemCard";
import type { Category, MenuItem } from "@/types";

interface Props {
  categories: (Category & { menuItems: MenuItem[] })[];
}

export default function MenuSection({ categories }: Props) {
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const allItems = categories.flatMap((c) => c.menuItems);
  const displayItems =
    activeCategory === "all"
      ? allItems
      : categories.find((c) => c.slug === activeCategory)?.menuItems ?? [];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide mb-8">
        <button
          onClick={() => setActiveCategory("all")}
          className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 border ${
            activeCategory === "all"
              ? "bg-flame text-white border-transparent"
              : "bg-kooqs-card text-kooqs-text-dim border-kooqs-border hover:border-kooqs-red hover:text-white"
          }`}
        >
          🍽️ All Items
        </button>
        {categories.map((cat) => (
          <button
            key={cat.slug}
            onClick={() => setActiveCategory(cat.slug)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 border ${
              activeCategory === cat.slug
                ? "bg-flame text-white border-transparent"
                : "bg-kooqs-card text-kooqs-text-dim border-kooqs-border hover:border-kooqs-red hover:text-white"
            }`}
          >
            <span>{cat.icon}</span>
            <span>{cat.name}</span>
            <span className="text-xs opacity-60">({cat.menuItems.length})</span>
          </button>
        ))}
      </div>

      {/* Items grid */}
      {activeCategory === "all" ? (
        <div className="space-y-12">
          {categories.map((cat) =>
            cat.menuItems.length > 0 ? (
              <div key={cat.id}>
                <div className="flex items-center gap-3 mb-5">
                  <span className="text-2xl">{cat.icon}</span>
                  <div>
                    <h2 className="text-white font-black text-xl">{cat.name}</h2>
                    {cat.description && (
                      <p className="text-kooqs-text-dim text-xs">{cat.description}</p>
                    )}
                  </div>
                  <div className="flex-1 h-px bg-kooqs-border ml-4" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {cat.menuItems.map((item) => (
                    <MenuItemCard key={item.id} item={item} />
                  ))}
                </div>
              </div>
            ) : null
          )}
        </div>
      ) : (
        <div>
          <div className="flex items-center gap-3 mb-6">
            <span className="text-2xl">{categories.find((c) => c.slug === activeCategory)?.icon}</span>
            <h2 className="text-white font-black text-2xl">
              {categories.find((c) => c.slug === activeCategory)?.name}
            </h2>
          </div>
          {displayItems.length === 0 ? (
            <div className="text-center py-16 text-kooqs-text-dim">No items available in this category.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {displayItems.map((item) => (
                <MenuItemCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
