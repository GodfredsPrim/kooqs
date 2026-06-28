"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { Plus, Pencil, Trash2, Flame, Leaf, Star, ToggleLeft, ToggleRight, X, Loader2, Upload } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import type { MenuItem, Category } from "@/types";
import toast from "react-hot-toast";

interface MenuItemForm {
  name: string;
  description: string;
  price: string;
  image: string;
  categoryId: string;
  available: boolean;
  featured: boolean;
  spicy: boolean;
  vegetarian: boolean;
  calories: string;
}

const EMPTY_FORM: MenuItemForm = {
  name: "", description: "", price: "", image: "", categoryId: "",
  available: true, featured: false, spicy: false, vegetarian: false, calories: "",
};

export default function MenuPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [form, setForm] = useState<MenuItemForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [itemsRes, catsRes] = await Promise.all([fetch("/api/menu"), fetch("/api/categories")]);
    const itemsData = await itemsRes.json();
    const catsData = await catsRes.json();
    setItems(itemsData);
    setCategories(catsData);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  function openAdd() {
    setEditingItem(null);
    setForm({ ...EMPTY_FORM, categoryId: categories[0]?.id ?? "" });
    setImagePreview(null);
    setShowModal(true);
  }

  function openEdit(item: MenuItem) {
    setEditingItem(item);
    setForm({
      name: item.name, description: item.description, price: item.price.toString(),
      image: item.image ?? "", categoryId: item.categoryId,
      available: item.available, featured: item.featured, spicy: item.spicy,
      vegetarian: item.vegetarian, calories: item.calories?.toString() ?? "",
    });
    setImagePreview(item.image ?? null);
    setShowModal(true);
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImagePreview(URL.createObjectURL(file));
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) throw new Error("Upload failed");
      const { url } = await res.json();
      setForm((f) => ({ ...f, image: url }));
    } catch {
      toast.error("Image upload failed");
      setImagePreview(form.image || null);
    } finally {
      setUploading(false);
    }
  }

  function clearImage() {
    setForm((f) => ({ ...f, image: "" }));
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const url = editingItem ? `/api/menu/${editingItem.id}` : "/api/menu";
    const method = editingItem ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      toast.success(editingItem ? "Item updated!" : "Item added!");
      setShowModal(false);
      fetchData();
    } else {
      toast.error("Failed to save item.");
    }
    setSaving(false);
  }

  async function toggleAvailability(item: MenuItem) {
    const res = await fetch(`/api/menu/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ available: !item.available }),
    });
    if (res.ok) {
      setItems((prev) => prev.map((i) => i.id === item.id ? { ...i, available: !i.available } : i));
      toast.success(`${item.name} ${!item.available ? "enabled" : "disabled"}`);
    }
  }

  async function deleteItem(item: MenuItem) {
    if (!confirm(`Delete "${item.name}"? This cannot be undone.`)) return;
    const res = await fetch(`/api/menu/${item.id}`, { method: "DELETE" });
    if (res.ok) {
      setItems((prev) => prev.filter((i) => i.id !== item.id));
      toast.success("Item deleted");
    }
  }

  const displayItems = activeCategory === "all" ? items : items.filter((i) => i.categoryId === activeCategory);

  return (
    <div className="p-4 sm:p-6 lg:p-8 mt-14 lg:mt-0">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-kooqs-text font-black text-2xl sm:text-3xl">Menu Management</h1>
          <p className="text-kooqs-text-dim text-sm mt-1">{items.length} items across {categories.length} categories</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={16} /> Add Item
        </button>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
        <button
          onClick={() => setActiveCategory("all")}
          className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium transition-all border ${activeCategory === "all" ? "bg-flame text-white border-transparent" : "bg-kooqs-card border-kooqs-border text-kooqs-text-dim hover:text-kooqs-text"}`}
        >
          All ({items.length})
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all border ${activeCategory === cat.id ? "bg-flame text-white border-transparent" : "bg-kooqs-card border-kooqs-border text-kooqs-text-dim hover:text-kooqs-text"}`}
          >
            {cat.icon} {cat.name}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16"><Loader2 size={24} className="animate-spin text-kooqs-red" /></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {displayItems.map((item) => (
            <div key={item.id} className={`card overflow-hidden transition-all ${!item.available ? "opacity-50" : ""}`}>
              <div className="relative h-36">
                {item.image ? (
                  <Image src={item.image} alt={item.name} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full bg-kooqs-muted flex items-center justify-center text-3xl">🍽️</div>
                )}
                <div className="absolute top-2 right-2 flex gap-1">
                  {item.featured && <span className="bg-kooqs-red text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5"><Star size={8} /></span>}
                  {item.spicy && <span className="bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full"><Flame size={8} /></span>}
                  {item.vegetarian && <span className="bg-green-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full"><Leaf size={8} /></span>}
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-kooqs-text font-bold text-sm leading-tight">{item.name}</h3>
                  <span className="text-kooqs-red font-black text-sm flex-shrink-0">{formatPrice(item.price)}</span>
                </div>
                <p className="text-kooqs-text-dim text-xs mt-1 line-clamp-2">{item.description}</p>
                <p className="text-kooqs-text-dim text-xs mt-1.5">{item.category?.name}</p>
                <div className="flex items-center gap-2 mt-3">
                  <button onClick={() => toggleAvailability(item)} className="flex items-center gap-1 text-xs text-kooqs-text-dim hover:text-kooqs-text transition-colors">
                    {item.available ? <ToggleRight size={16} className="text-green-400" /> : <ToggleLeft size={16} />}
                    {item.available ? "Available" : "Hidden"}
                  </button>
                  <div className="flex-1" />
                  <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg hover:bg-kooqs-muted text-kooqs-text-dim hover:text-kooqs-text transition-colors">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => deleteItem(item)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-kooqs-text-dim hover:text-red-400 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-kooqs-card border border-kooqs-border rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-kooqs-border">
              <h2 className="text-kooqs-text font-bold text-lg">{editingItem ? "Edit Item" : "Add New Item"}</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-kooqs-muted text-kooqs-text-dim hover:text-kooqs-text">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-kooqs-text-dim text-xs font-medium block mb-1.5">Name *</label>
                  <input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="input" placeholder="e.g. Classic Burger" />
                </div>
                <div>
                  <label className="text-kooqs-text-dim text-xs font-medium block mb-1.5">Price ($) *</label>
                  <input required type="number" step="0.01" min="0" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} className="input" placeholder="12.99" />
                </div>
                <div>
                  <label className="text-kooqs-text-dim text-xs font-medium block mb-1.5">Calories</label>
                  <input type="number" value={form.calories} onChange={(e) => setForm((f) => ({ ...f, calories: e.target.value }))} className="input" placeholder="680" />
                </div>
                <div className="col-span-2">
                  <label className="text-kooqs-text-dim text-xs font-medium block mb-1.5">Category *</label>
                  <select required value={form.categoryId} onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))} className="input">
                    {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="text-kooqs-text-dim text-xs font-medium block mb-1.5">Description *</label>
                  <textarea required value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="input resize-none h-20" placeholder="Describe the item..." />
                </div>
                <div className="col-span-2">
                  <label className="text-kooqs-text-dim text-xs font-medium block mb-1.5">Image</label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  {imagePreview ? (
                    <div className="relative w-full h-36 rounded-xl overflow-hidden border border-kooqs-border">
                      <Image src={imagePreview} alt="Preview" fill className="object-cover" unoptimized={imagePreview.startsWith("blob:")} />
                      <button
                        type="button"
                        onClick={clearImage}
                        className="absolute top-2 right-2 bg-black/70 rounded-full p-1 text-white hover:bg-kooqs-red transition-colors"
                      >
                        <X size={14} />
                      </button>
                      {uploading && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <Loader2 size={24} className="animate-spin text-white" />
                        </div>
                      )}
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full h-28 rounded-xl border-2 border-dashed border-kooqs-border hover:border-kooqs-red transition-colors flex flex-col items-center justify-center gap-2 text-kooqs-text-dim hover:text-kooqs-text"
                    >
                      <Upload size={20} />
                      <span className="text-xs font-medium">Upload from device / camera</span>
                    </button>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {(["available", "featured", "spicy", "vegetarian"] as const).map((key) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form[key]} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.checked }))} className="w-4 h-4 accent-kooqs-red" />
                    <span className="text-kooqs-text text-sm capitalize">{key}</span>
                  </label>
                ))}
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {saving ? <Loader2 size={14} className="animate-spin" /> : null}
                  {editingItem ? "Save Changes" : "Add Item"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
