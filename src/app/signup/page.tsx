"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import AuthShell from "@/components/AuthShell";

const FOREST = "#1b4332";
const FOREST_DARK = "#102a1c";
const SAGE = "#2d6a4f";
const MUTED_GREEN = "#5b7a68";
const BORDER_GREEN = "#cfe3d6";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const emailId = useId();
  const passwordId = useId();

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
      <AuthShell>
        <div className="flex flex-col items-center text-center" role="status">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl text-2xl shadow-md" style={{ background: `linear-gradient(135deg, ${FOREST}, ${SAGE})` }} aria-hidden="true">📬</div>
          <h1 className="text-2xl font-bold" style={{ color: FOREST_DARK, fontFamily: "var(--font-display)" }}>Check your email</h1>
          <p className="mt-2 max-w-[16rem] text-sm leading-relaxed" style={{ color: MUTED_GREEN }}>
            We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account.
          </p>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <div className="mb-7 flex flex-col items-center text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl text-2xl shadow-md" style={{ background: `linear-gradient(135deg, ${FOREST}, ${SAGE})` }} aria-hidden="true">🌿</div>
        <h1 className="text-2xl font-bold" style={{ color: FOREST_DARK, fontFamily: "var(--font-display)" }}>Start your Leaflog</h1>
        <p className="mt-1.5 max-w-[15rem] text-sm leading-relaxed" style={{ color: MUTED_GREEN }}>Free to use, yours forever.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
        <div>
          <label htmlFor={emailId} className="sr-only">Email</label>
          <div className="flex items-center gap-2.5 rounded-2xl border bg-white px-4 py-3 transition-colors focus-within:border-emerald-600" style={{ borderColor: BORDER_GREEN }}>
            <svg className="h-4 w-4 shrink-0" fill="none" stroke={MUTED_GREEN} viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <input
              id={emailId}
              type="email"
              required
              aria-required="true"
              autoComplete="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-stone-400"
            />
          </div>
        </div>

        <div>
          <label htmlFor={passwordId} className="sr-only">Password</label>
          <div className="flex items-center gap-2.5 rounded-2xl border bg-white px-4 py-3 transition-colors focus-within:border-emerald-600" style={{ borderColor: BORDER_GREEN }}>
            <svg className="h-4 w-4 shrink-0" fill="none" stroke={MUTED_GREEN} viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-12V7a4 4 0 10-8 0v2" />
            </svg>
            <input
              id={passwordId}
              type={showPassword ? "text" : "password"}
              required
              aria-required="true"
              minLength={6}
              autoComplete="new-password"
              aria-describedby={`${passwordId}-hint`}
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-stone-400"
            />
            <button
              type="button"
              onClick={() => setShowPassword(v => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors hover:bg-stone-100"
            >
              {showPassword ? (
                <svg className="h-4 w-4" fill="none" stroke={MUTED_GREEN} viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18M10.58 10.58a2 2 0 102.83 2.83M9.88 5.09A9.96 9.96 0 0112 5c5 0 9 4.5 10 7-.46 1.13-1.18 2.27-2.1 3.31M6.1 6.1C4.2 7.39 2.78 9.2 2 12c1 2.5 5 7 10 7 1.04 0 2.02-.18 2.93-.5" />
                </svg>
              ) : (
                <svg className="h-4 w-4" fill="none" stroke={MUTED_GREEN} viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
                </svg>
              )}
            </button>
          </div>
          <p id={`${passwordId}-hint`} className="mt-1.5 text-xs" style={{ color: MUTED_GREEN }}>At least 6 characters</p>
        </div>

        {error && (
          <p role="alert" aria-live="polite" className="text-sm text-red-700">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-2xl py-3 text-sm font-semibold text-white shadow-md transition-opacity hover:opacity-90 disabled:opacity-50"
          style={{ background: `linear-gradient(135deg, ${FOREST}, ${FOREST_DARK})` }}
        >
          {loading ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm" style={{ color: MUTED_GREEN }}>
        Already have an account?{" "}
        <Link href="/login" className="font-medium hover:underline" style={{ color: SAGE }}>
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
