import Link from "next/link";

const u = (id: string, opts: { w?: number; h?: number; crop?: string; sat?: number; bri?: number } = {}) => {
  const p = [`w=${opts.w ?? 900}`, "q=80", "fit=crop", "auto=format", `crop=${opts.crop ?? "center"}`];
  if (opts.h) p.push(`h=${opts.h}`);
  if (opts.sat != null) p.push(`sat=${opts.sat}`);
  if (opts.bri != null) p.push(`bri=${opts.bri}`);
  return `https://images.unsplash.com/photo-${id}?${p.join("&")}`;
};

const MONSTERA = "1545241047-6083a3684587";
const PROPAGATION = "1416879595882-3373a0480b5b";
const SHELF = "1459156212016-c812468e2115";
const PERSON1 = "1463936575829-25148e1db1b8";
const PERSON2 = "1509423350716-97f9360b4e09";

const timeline = [
  { url: u(MONSTERA, { w: 460, h: 600, sat: -38, bri: -6 }), label: "Jun", note: "Came home from the market." },
  { url: u(MONSTERA, { w: 460, h: 600, sat: -19, bri: -3 }), label: "Aug", note: "First new leaf unfurled." },
  { url: u(MONSTERA, { w: 460, h: 600, sat: -10, bri: -2 }), label: "Oct", note: "Repotted up a size." },
  { url: u(MONSTERA, { w: 460, h: 600 }), label: "Today", note: "Look how far she's come." },
];

const features = [
  { title: "A photo a check-in", body: "Snap your plant whenever you water or just want to say hi. We line them up by date — no folders, no fuss.", img: u(MONSTERA, { w: 640, h: 420 }) },
  { title: "Notes that remember why", body: "Repotted? Moved to the window? New pup? Jot it down and the note rides right beside its photo, forever.", img: u(PROPAGATION, { w: 640, h: 420 }) },
  { title: "Sort your whole jungle", body: "Rooms, tags, and collections keep a forty-plant windowsill from turning into a guessing game.", img: u(SHELF, { w: 640, h: 420 }) },
];

const profiles = [
  { name: "Maya Okafor", handle: "@maya", initials: "MO", avatarBg: "#7a5230", count: 31, blurb: "Bird of paradise whisperer. Three-year growth timelines and counting.", img: u(PROPAGATION, { w: 600, h: 380 }) },
  { name: "Devin Cho", handle: "@devin", initials: "DC", avatarBg: "#3a5544", count: 18, blurb: "Cactus dad. Documents every spike, survives every repot.", img: u(PERSON1, { w: 600, h: 380 }) },
  { name: "Priya Nair", handle: "@priya", initials: "PN", avatarBg: "#1c1f2e", count: 44, blurb: "Propagation queen. Half her shelf started as a friend's cutting.", img: u(PERSON2, { w: 600, h: 380 }) },
];

const footerCols = [
  { head: "Product", links: ["Features", "Timeline", "Collections", "Mobile"] },
  { head: "Community", links: ["Public profiles", "Explore", "Share a plant"] },
  { head: "Company", links: ["About", "Privacy", "Contact"] },
];

export default function Home() {
  return (
    <div style={{ background: "var(--cream)", color: "var(--text)" }}>
      {/* Nav */}
      <header className="flex items-center justify-between px-8 py-6 sm:px-14">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl text-lg" style={{ background: "var(--orange)" }}>🌿</div>
          <span className="text-xl font-bold" style={{ fontFamily: "var(--font-display)" }}>Leaflog</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-semibold" style={{ color: "var(--text)" }}>Sign in</Link>
          <Link
            href="/signup"
            className="rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: "var(--navy)" }}
          >
            Get started
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="grid items-center gap-10 px-8 py-12 sm:px-14 sm:py-16 lg:grid-cols-2">
        <div>
          <p className="mb-5 text-xs font-semibold uppercase tracking-widest" style={{ color: "#b85a16" }}>The houseplant diary</p>
          <h1 className="mb-5 text-5xl font-bold leading-[1.02] tracking-tight sm:text-6xl" style={{ fontFamily: "var(--font-display)" }}>
            Watch them<br />grow.
          </h1>
          <p className="mb-7 max-w-md text-lg leading-relaxed" style={{ color: "#4b4f59" }}>
            Snap a photo every time you check in. Leaflog quietly lines them up by date and builds the growth timeline for you — so six months from now you&apos;re not guessing, you&apos;re scrolling through proof.
          </p>
          <div className="flex flex-wrap items-center gap-3.5">
            <Link
              href="/signup"
              className="rounded-xl px-6 py-3.5 text-base font-semibold text-white shadow-lg transition-opacity hover:opacity-90"
              style={{ background: "var(--orange)", boxShadow: "0 8px 22px rgba(249,115,22,.32)" }}
            >
              Start your diary — free
            </Link>
            <Link
              href="/login"
              className="rounded-xl border px-5 py-3.5 text-base font-semibold transition-colors hover:bg-black/5"
              style={{ borderColor: "#cfc8bb", color: "var(--text)" }}
            >
              See an example
            </Link>
          </div>
          <p className="mt-4 text-sm" style={{ color: "#8a8d84" }}>No card. No clutter. Just your plants.</p>
        </div>

        {/* Hero visual */}
        <div className="rounded-3xl bg-white p-4 shadow-2xl" style={{ boxShadow: "0 24px 60px rgba(36,38,28,.16)" }}>
          <div className="relative overflow-hidden rounded-2xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={u(MONSTERA, { w: 760, h: 660 })} alt="Monty the monstera" className="h-[330px] w-full object-cover" />
            <div className="absolute left-3.5 top-3.5 rounded-full px-3 py-1.5 text-xs font-semibold text-white backdrop-blur" style={{ background: "rgba(28,31,46,.62)" }}>
              Monty · Monstera deliciosa
            </div>
            <div className="absolute bottom-3.5 right-3.5 rounded-full px-3 py-1.5 text-xs font-bold text-white" style={{ background: "var(--orange)" }}>
              Today
            </div>
          </div>
          <div className="mb-2.5 mt-4 flex items-center justify-between px-1">
            <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "#8a8d84" }}>Growth timeline</p>
            <p className="text-xs" style={{ color: "#8a8d84" }}>{timeline.length} check-ins</p>
          </div>
          <div className="flex gap-2">
            {timeline.map((f, i) => {
              const isLast = i === timeline.length - 1;
              return (
                <div key={f.label} className="flex-1 text-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={f.url}
                    alt=""
                    className="h-[54px] w-full rounded-lg object-cover"
                    style={{ border: isLast ? `2px solid var(--orange)` : "2px solid transparent" }}
                  />
                  <p className="mt-1.5 text-xs font-semibold" style={{ color: isLast ? "#b85a16" : "#8a8d84" }}>{f.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Timeline showcase */}
      <section className="bg-white px-8 py-16 sm:px-14">
        <div className="mx-auto mb-11 max-w-xl text-center">
          <p className="mb-3.5 text-xs font-semibold uppercase tracking-widest" style={{ color: "#b85a16" }}>The timeline writes itself</p>
          <h2 className="mb-3.5 text-4xl font-bold leading-tight tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
            One photo at a time, a whole story.
          </h2>
          <p className="text-base leading-relaxed" style={{ color: "var(--muted)" }}>
            Every check-in lands on the timeline in order. The notes ride right alongside, so the{" "}
            <em className="not-italic font-medium" style={{ color: "#2f6b41" }}>why</em> never gets separated from the{" "}
            <em className="not-italic font-medium" style={{ color: "#2f6b41" }}>what changed</em>.
          </p>
        </div>
        <div className="flex flex-wrap items-end justify-center gap-6 px-2">
          {timeline.map((f, i) => (
            <div key={f.label} className="w-44 flex-none">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={f.url}
                alt=""
                className="w-full rounded-2xl object-cover shadow-md"
                style={{ height: `${150 + (i / (timeline.length - 1)) * 96}px` }}
              />
              <div className="mt-3.5 flex items-center gap-2">
                <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: i === timeline.length - 1 ? "var(--orange)" : "#9ca3af" }} />
                <span className="text-sm font-semibold" style={{ fontFamily: "var(--font-display)" }}>{f.label}</span>
              </div>
              <p className="mt-1.5 text-sm" style={{ color: "var(--muted)" }}>{f.note}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Feature trio */}
      <section className="px-8 py-16 sm:px-14">
        <h2 className="mb-9 text-3xl font-bold tracking-tight" style={{ fontFamily: "var(--font-display)" }}>Everything rides together.</h2>
        <div className="grid gap-6 sm:grid-cols-3">
          {features.map(ft => (
            <div key={ft.title} className="overflow-hidden rounded-2xl bg-white" style={{ border: "1px solid #ece6db" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={ft.img} alt="" className="h-42 w-full object-cover" style={{ height: 168 }} />
              <div className="p-5.5">
                <h3 className="mb-2 text-xl font-bold tracking-tight" style={{ fontFamily: "var(--font-display)" }}>{ft.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>{ft.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Before/after */}
      <section className="mx-8 mb-16 grid overflow-hidden rounded-3xl sm:mx-14 lg:grid-cols-2" style={{ background: "var(--navy)" }}>
        <div className="grid grid-cols-2 gap-0.5" style={{ background: "#0f1119" }}>
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={u(MONSTERA, { w: 440, h: 540, crop: "top", sat: -32, bri: -6 })} alt="Before" className="h-full w-full object-cover" />
            <span className="absolute left-3.5 top-3.5 rounded-full px-2.5 py-1 text-xs font-bold text-white" style={{ background: "rgba(0,0,0,.5)" }}>Before</span>
          </div>
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={u(MONSTERA, { w: 440, h: 540, crop: "bottom" })} alt="After" className="h-full w-full object-cover" />
            <span className="absolute left-3.5 top-3.5 rounded-full px-2.5 py-1 text-xs font-bold" style={{ background: "#9be7a8", color: "var(--navy)" }}>After</span>
          </div>
        </div>
        <div className="flex flex-col justify-center p-11 text-white">
          <p className="mb-3.5 text-xs font-semibold uppercase tracking-widest" style={{ color: "#f9a05f" }}>Proof, not guesswork</p>
          <h2 className="mb-3.5 text-3xl font-bold leading-tight tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
            Six months. Same plant. Same pot.
          </h2>
          <p className="mb-6 text-base leading-relaxed" style={{ color: "#b9bcc6" }}>
            Pull any two check-ins side by side and watch the difference. It&apos;s the quiet kind of progress you&apos;d never notice day to day.
          </p>
          <Link
            href="/signup"
            className="inline-block w-fit rounded-xl px-5.5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: "var(--orange)" }}
          >
            Compare your own
          </Link>
        </div>
      </section>

      {/* Community */}
      <section className="px-8 pb-16 sm:px-14">
        <div className="mb-7 flex items-end justify-between gap-4">
          <div>
            <h2 className="mb-2 text-3xl font-bold tracking-tight" style={{ fontFamily: "var(--font-display)" }}>Got a jungle? Show it off.</h2>
            <p className="max-w-md text-base" style={{ color: "var(--muted)" }}>Make your profile public and plant friends can follow along — or keep the whole thing just for you.</p>
          </div>
          <span className="shrink-0 text-sm font-semibold" style={{ color: "#b85a16" }}>Explore profiles →</span>
        </div>
        <div className="grid gap-6 sm:grid-cols-3">
          {profiles.map(pr => (
            <div key={pr.handle} className="overflow-hidden rounded-2xl bg-white" style={{ border: "1px solid #ece6db" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={pr.img} alt="" className="h-36 w-full object-cover" />
              <div className="p-4.5">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9.5 w-9.5 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white" style={{ background: pr.avatarBg, width: 38, height: 38 }}>
                    {pr.initials}
                  </div>
                  <div className="leading-tight">
                    <p className="text-sm font-bold">{pr.name}</p>
                    <p className="text-xs" style={{ color: "#8a8d84" }}>{pr.handle} · {pr.count} plants</p>
                  </div>
                </div>
                <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--muted)" }}>{pr.blurb}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Free CTA */}
      <section className="mx-8 mb-16 rounded-3xl px-8 py-14 text-center sm:mx-14" style={{ background: "#e7f0e3" }}>
        <h2 className="mb-3 text-4xl font-bold tracking-tight sm:text-5xl" style={{ fontFamily: "var(--font-display)" }}>
          It&apos;s free. Go log a plant.
        </h2>
        <p className="mb-7 text-base" style={{ color: "#42583f" }}>Start with one. You&apos;ll have a timeline before you know it.</p>
        <Link
          href="/signup"
          className="inline-block rounded-2xl px-8 py-4 text-base font-semibold text-white transition-opacity hover:opacity-90"
          style={{ background: "var(--navy)" }}
        >
          Get started — it&apos;s free
        </Link>
      </section>

      {/* Footer */}
      <footer className="px-8 py-12 sm:px-14" style={{ background: "var(--navy)", color: "#9ca3af" }}>
        <div className="flex flex-col gap-10 sm:flex-row sm:justify-between">
          <div className="max-w-xs">
            <div className="mb-3 flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl text-base" style={{ background: "var(--orange)" }}>🌿</div>
              <span className="text-lg font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>Leaflog</span>
            </div>
            <p className="text-sm leading-relaxed">A quiet place to track your houseplants — photos, notes, and a timeline of growth.</p>
          </div>
          <div className="flex flex-wrap gap-12">
            {footerCols.map(col => (
              <div key={col.head}>
                <p className="mb-3.5 text-xs font-bold uppercase tracking-wider" style={{ color: "#6b7280" }}>{col.head}</p>
                <div className="flex flex-col gap-2.5 text-sm">
                  {col.links.map(link => (
                    <span key={link}>{link}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-10 border-t pt-5.5 text-xs" style={{ borderColor: "var(--navy-border)", color: "#6b7280" }}>
          © 2026 Leaflog · Grown with care.
        </div>
      </footer>
    </div>
  );
}
