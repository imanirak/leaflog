import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="max-w-md text-center">
        <div className="mb-6 text-6xl">🌿</div>
        <h1 className="mb-3 text-4xl font-semibold tracking-tight text-stone-900">Leaflog</h1>
        <p className="mb-8 text-lg text-stone-500">
          A quiet place to track your houseplants — photos, notes, and a timeline of growth.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/signup"
            className="rounded-xl bg-green-700 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-green-800"
          >
            Get started
          </Link>
          <Link
            href="/login"
            className="rounded-xl border border-stone-200 bg-white px-6 py-3 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-50"
          >
            Sign in
          </Link>
        </div>
      </div>
    </main>
  );
}
