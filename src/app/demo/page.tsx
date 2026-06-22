import Link from "next/link";

const u = (id: string, opts: { w?: number; h?: number; crop?: string; sat?: number; bri?: number } = {}) => {
  const p = [`w=${opts.w ?? 900}`, "q=80", "fit=crop", "auto=format", `crop=${opts.crop ?? "center"}`];
  if (opts.h) p.push(`h=${opts.h}`);
  if (opts.sat != null) p.push(`sat=${opts.sat}`);
  if (opts.bri != null) p.push(`bri=${opts.bri}`);
  return `https://images.unsplash.com/photo-${id}?${p.join("&")}`;
};

const MONSTERA = "1545241047-6083a3684587";

const photos = [
  { id: "p1", caption: "Came home from the market.", date: "Jun 12", img: u(MONSTERA, { w: 760, h: 660, sat: -38, bri: -6 }) },
  { id: "p2", caption: "First new leaf unfurled!", date: "Aug 3", img: u(MONSTERA, { w: 760, h: 660, sat: -19, bri: -3 }) },
  { id: "p3", caption: "Repotted up a size — roots were getting cramped.", date: "Oct 19", img: u(MONSTERA, { w: 760, h: 660, sat: -10, bri: -2 }) },
  { id: "p4", caption: "Look how far she's come.", date: "Today", img: u(MONSTERA, { w: 760, h: 660 }) },
];

const notes = [
  { id: "n1", body: "Moved closer to the east window — she seemed to want more light.", date: "Jul 2" },
  { id: "n2", body: "Watered, soil was bone dry. Setting a reminder for every 9 days.", date: "Sep 14" },
];

type TimelineItem =
  | { kind: "photo"; date: string; sortKey: number; data: typeof photos[number] }
  | { kind: "note"; date: string; sortKey: number; data: typeof notes[number] };

const timeline: TimelineItem[] = [
  ...photos.map((p, i) => ({ kind: "photo" as const, date: p.date, sortKey: i * 10, data: p })),
  ...notes.map((n, i) => ({ kind: "note" as const, date: n.date, sortKey: i * 10 + 5, data: n })),
].sort((a, b) => b.sortKey - a.sortKey);

export default function DemoPage() {
  return (
    <div style={{ background: "var(--cream)" }}>
      {/* Demo banner */}
      <div className="flex items-center justify-center gap-3 px-6 py-3 text-center text-sm font-medium text-white" style={{ background: "var(--navy)" }}>
        <span>🌿 You&apos;re viewing a sample plant page — Monty isn&apos;t real (but your plants can be).</span>
        <Link href="/signup" className="rounded-full px-3 py-1 text-xs font-bold" style={{ background: "var(--orange)", color: "var(--navy)" }}>
          Start your diary →
        </Link>
      </div>

      <div className="mx-auto max-w-3xl p-8">
        <Link href="/" className="mb-3 inline-flex items-center gap-1 text-sm" style={{ color: "var(--muted)" }}>
          ← Back home
        </Link>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold" style={{ color: "var(--text)", fontFamily: "var(--font-display)" }}>Monty</h1>
          <p className="mt-1 italic text-sm" style={{ color: "var(--muted)" }}>Monstera deliciosa</p>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm" style={{ color: "var(--muted)" }}>
            <span>📍 Living room</span>
            <span>Added June 12, 2024</span>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {["tropical", "easy-care", "statement-plant"].map(tag => (
              <span key={tag} className="rounded-full px-2.5 py-0.5 text-xs font-medium" style={{ background: "var(--orange-light)", color: "var(--orange-text)" }}>
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Hero + filmstrip */}
        <div className="mb-6 rounded-3xl bg-white p-3 shadow-sm" style={{ border: "1px solid #ede8e0" }}>
          <div className="relative overflow-hidden rounded-2xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photos[photos.length - 1].img} alt="Most recent photo of Monty the monstera" className="h-72 w-full object-cover" />
            <div className="absolute left-3.5 top-3.5 rounded-full px-3 py-1.5 text-xs font-semibold text-white backdrop-blur" style={{ background: "rgba(28,31,46,.62)" }}>
              Monty · Monstera deliciosa
            </div>
            <div className="absolute bottom-3.5 right-3.5 rounded-full px-3 py-1.5 text-xs font-bold" style={{ background: "var(--orange)", color: "var(--navy)" }}>
              Today
            </div>
          </div>
          <div className="mb-2.5 mt-4 flex items-center justify-between px-1">
            <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--muted)" }}>Growth timeline</p>
            <p className="text-xs" style={{ color: "var(--muted)" }}>{photos.length} check-ins</p>
          </div>
          <div className="flex gap-2">
            {photos.map((p, i) => {
              const isLast = i === photos.length - 1;
              return (
                <div key={p.id} className="flex-1">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.img}
                    alt=""
                    className="h-14 w-full rounded-lg object-cover"
                    style={{ border: isLast ? "2px solid var(--orange)" : "2px solid transparent" }}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Watering status */}
        <div className="mb-6 flex items-center gap-3 rounded-2xl px-4 py-3" style={{ background: "var(--card)", border: "1px solid #ede8e0" }}>
          <span className="text-xl" aria-hidden="true">💧</span>
          <p className="text-sm" style={{ color: "var(--muted)" }}>Last watered 3 days ago</p>
        </div>

        {/* Timeline */}
        <section>
          <h2 className="mb-4 text-lg font-semibold" style={{ color: "var(--text)" }}>Timeline</h2>
          <div className="space-y-3">
            {timeline.map(item => {
              if (item.kind === "photo") {
                const p = item.data;
                return (
                  <div key={p.id} className="overflow-hidden rounded-2xl" style={{ border: "1px solid #ede8e0" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.img} alt={`Monty: ${p.caption}`} className="h-64 w-full object-cover" />
                    <div className="flex items-center justify-between px-3.5 py-2.5" style={{ background: "var(--card)" }}>
                      <p className="text-sm" style={{ color: "var(--text)" }}>{p.caption}</p>
                      <p className="shrink-0 pl-3 text-xs" style={{ color: "var(--muted)" }}>{p.date}</p>
                    </div>
                  </div>
                );
              }
              const n = item.data;
              return (
                <div key={n.id} className="flex items-start gap-3 rounded-2xl p-4" style={{ background: "var(--card)", border: "1px solid #ede8e0" }}>
                  <span className="mt-0.5 text-base" aria-hidden="true">📝</span>
                  <div className="flex-1">
                    <p className="text-sm" style={{ color: "var(--text)" }}>{n.body}</p>
                    <p className="mt-1 text-xs" style={{ color: "var(--muted)" }}>{n.date}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* CTA */}
        <div className="mt-10 rounded-3xl px-8 py-10 text-center" style={{ background: "#e7f0e3" }}>
          <h2 className="mb-2 text-2xl font-bold tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
            Ready to start your own?
          </h2>
          <p className="mb-5 text-sm" style={{ color: "#42583f" }}>It&apos;s free, and your first plant takes two minutes to add.</p>
          <Link
            href="/signup"
            className="inline-block rounded-xl px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: "var(--navy)" }}
          >
            Get started — it&apos;s free
          </Link>
        </div>
      </div>
    </div>
  );
}
