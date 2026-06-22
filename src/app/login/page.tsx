"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/app");
      router.refresh();
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6" style={{ background: "var(--cream)" }}>
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mb-3 text-4xl" aria-hidden="true">🌿</div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text)", fontFamily: "var(--font-display)" }}>Welcome back</h1>
          <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>Sign in to your Leaflog</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label htmlFor="login-email" className="mb-1.5 block text-sm font-medium" style={{ color: "var(--text)" }}>
              Email <span aria-hidden="true">*</span>
            </label>
            <input
              id="login-email"
              type="email"
              required
              aria-required="true"
              autoComplete="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full rounded-xl border bg-white px-4 py-2.5 text-sm outline-none focus:border-orange-400"
              style={{ borderColor: "#ddd5c8" }}
            />
          </div>
          <div>
            <label htmlFor="login-password" className="mb-1.5 block text-sm font-medium" style={{ color: "var(--text)" }}>
              Password <span aria-hidden="true">*</span>
            </label>
            <input
              id="login-password"
              type="password"
              required
              aria-required="true"
              autoComplete="current-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full rounded-xl border bg-white px-4 py-2.5 text-sm outline-none focus:border-orange-400"
              style={{ borderColor: "#ddd5c8" }}
            />
          </div>
          {error && (
            <p role="alert" aria-live="polite" className="text-sm text-red-700">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl py-2.5 text-sm font-semibold shadow-sm transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ background: "var(--orange)", color: "var(--navy)" }}
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm" style={{ color: "var(--muted)" }}>
          No account?{" "}
          <Link href="/signup" className="font-medium hover:underline" style={{ color: "var(--orange-text)" }}>
            Sign up
          </Link>
        </p>
      </div>
    </main>
  );
}
