"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setDone(true);
    }
  }

  if (done) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6" style={{ background: "var(--cream)" }}>
        <div className="w-full max-w-sm text-center">
          <div className="mb-3 text-4xl">📬</div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text)", fontFamily: "var(--font-display)" }}>Check your email</h1>
          <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>
            We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6" style={{ background: "var(--cream)" }}>
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mb-3 text-4xl">🌿</div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text)", fontFamily: "var(--font-display)" }}>Start your Leaflog</h1>
          <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>Free to use, yours forever</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium" style={{ color: "var(--text)" }}>Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full rounded-xl border bg-white px-4 py-2.5 text-sm outline-none focus:border-orange-400"
              style={{ borderColor: "#ddd5c8" }}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium" style={{ color: "var(--text)" }}>Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full rounded-xl border bg-white px-4 py-2.5 text-sm outline-none focus:border-orange-400"
              style={{ borderColor: "#ddd5c8" }}
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl py-2.5 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ background: "var(--orange)" }}
          >
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm" style={{ color: "var(--muted)" }}>
          Already have an account?{" "}
          <Link href="/login" className="font-medium hover:underline" style={{ color: "var(--orange)" }}>
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
