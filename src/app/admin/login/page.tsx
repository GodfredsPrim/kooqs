"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Loader2, Lock, Mail } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminLoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const result = await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });
    setLoading(false);

    if (result?.error) {
      toast.error("Invalid credentials. Please try again.");
    } else {
      router.push("/admin/dashboard");
    }
  }

  return (
    <div className="min-h-screen bg-kooqs-dark flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <Image src="/logo.jpeg" alt="Kooqs" width={80} height={80} className="rounded-full mx-auto mb-4 border-2 border-kooqs-red/30" />
          <h1 className="text-kooqs-text font-black text-2xl">Kooqs <span className="text-gradient-flame">Admin</span></h1>
          <p className="text-kooqs-text-dim text-sm mt-1">Restaurant Management System</p>
        </div>

        <form onSubmit={handleSubmit} className="card p-6 space-y-4">
          <div>
            <label className="text-kooqs-text-dim text-sm font-medium block mb-1.5 flex items-center gap-1.5">
              <Mail size={13} /> Email
            </label>
            <input
              required
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              placeholder="admin@kooqs.com"
              className="input"
            />
          </div>
          <div>
            <label className="text-kooqs-text-dim text-sm font-medium block mb-1.5 flex items-center gap-1.5">
              <Lock size={13} /> Password
            </label>
            <input
              required
              type="password"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              placeholder="••••••••"
              className="input"
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
            {loading ? <><Loader2 size={16} className="animate-spin" /> Signing in...</> : "Sign In"}
          </button>
        </form>

        <p className="text-center text-kooqs-text-dim text-xs mt-4">
          Protected admin area · <span className="text-kooqs-red">Kooqs.Takeout</span>
        </p>
      </div>
    </div>
  );
}
