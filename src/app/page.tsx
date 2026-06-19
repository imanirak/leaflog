import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6" style={{ background: "var(--bg)" }}>
      <div className="w-full max-w-sm text-center">
        <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl text-3xl" style={{ background: "var(--green-light)" }}>
          🌿
        </div>
        <h1 className="mb-2 text-4xl font-bold tracking-tight" style={{ color: "var(--text)", fontFamily: "var(--font-display)" }}>
          Leaflog
        </h1>
        <p className="mb-8 text-base" style={{ color: "var(--muted)" }}>
          A quiet place to track your houseplants — photos, notes, and a timeline of growth.
        </p>
        <div className="flex flex-col gap-3">
          <Link
            href="/signup"
            className="w-full rounded-xl py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: "var(--green)" }}
          >
            Get started — it&apos;s free
          </Link>
          <Link
            href="/login"
            className="w-full rounded-xl border py-3 text-sm font-semibold transition-colors hover:bg-slate-50"
            style={{ borderColor: "var(--border)", color: "var(--text)" }}
          >
            Sign in
          </Link>
        </div>
      </div>
    </main>
  );
}
