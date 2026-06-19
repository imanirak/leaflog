import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { deleteCareEntry, type CareType } from "@/lib/careLogActions";

const CARE_META: Record<CareType, { label: string; emoji: string }> = {
  watered: { label: "Watered", emoji: "💧" },
  fertilized: { label: "Fertilized", emoji: "🌱" },
  repotted: { label: "Repotted", emoji: "🪴" },
  pruned: { label: "Pruned", emoji: "✂️" },
  misted: { label: "Misted", emoji: "💦" },
  rotated: { label: "Rotated", emoji: "🔄" },
  other: { label: "Care", emoji: "📋" },
};

type Entry = {
  id: string; type: CareType; note: string | null; logged_at: string;
  plants: { id: string; name: string } | null;
};

export default async function CareLogPage({
  searchParams,
}: {
  searchParams: Promise<{ plant?: string; type?: string }>;
}) {
  const supabase = await createClient();
  const params = await searchParams;
  const { data: { user } } = await supabase.auth.getUser();

  let query = supabase
    .from("care_log_entries")
    .select("*, plants(id, name)")
    .eq("user_id", user!.id)
    .order("logged_at", { ascending: false });

  if (params.plant) query = query.eq("plant_id", params.plant);
  if (params.type) query = query.eq("type", params.type);

  const { data: entriesRaw } = await query.limit(100);
  const entries = (entriesRaw ?? []) as unknown as Entry[];

  const { data: plantsRaw } = await supabase.from("plants").select("id, name").order("name");
  const plants = (plantsRaw ?? []) as { id: string; name: string }[];

  // Plants needing attention: no watering in 7+ days (or never)
  const { data: lastWateredRaw } = await supabase
    .from("care_log_entries")
    .select("plant_id, logged_at")
    .eq("user_id", user!.id)
    .eq("type", "watered")
    .order("logged_at", { ascending: false });
  const lastWatered = (lastWateredRaw ?? []) as { plant_id: string; logged_at: string }[];
  const lastWateredMap = new Map<string, string>();
  for (const w of lastWatered) {
    if (!lastWateredMap.has(w.plant_id)) lastWateredMap.set(w.plant_id, w.logged_at);
  }
  const needsWater = plants.filter(p => {
    const last = lastWateredMap.get(p.id);
    if (!last) return true;
    return (Date.now() - new Date(last).getTime()) / (1000 * 60 * 60 * 24) >= 7;
  });

  // Group entries by date
  const grouped = new Map<string, Entry[]>();
  for (const e of entries) {
    const day = new Date(e.logged_at).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
    if (!grouped.has(day)) grouped.set(day, []);
    grouped.get(day)!.push(e);
  }

  return (
    <div className="mx-auto max-w-3xl p-8">
      <h1 className="mb-1 text-3xl font-bold" style={{ color: "var(--text)", fontFamily: "var(--font-display)" }}>Care log</h1>
      <p className="mb-6 text-sm" style={{ color: "var(--muted)" }}>A timeline of everything you've done for your plants.</p>

      {/* Needs attention */}
      {needsWater.length > 0 && (
        <div className="mb-6 rounded-2xl px-5 py-4" style={{ background: "#fef2f2", border: "1px solid #fecaca" }}>
          <p className="mb-2 flex items-center gap-2 text-sm font-semibold" style={{ color: "#b91c1c" }}>
            🔔 Needs attention — {needsWater.length} plant{needsWater.length !== 1 ? "s" : ""} overdue for water
          </p>
          <div className="flex flex-wrap gap-2">
            {needsWater.map(p => (
              <Link
                key={p.id}
                href={`/app/plants/${p.id}`}
                className="rounded-full px-3 py-1 text-xs font-medium"
                style={{ background: "white", color: "#b91c1c", border: "1px solid #fecaca" }}
              >
                {p.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#9ca3af" }}>Plant</span>
        <Link
          href="/app/care-log"
          className="rounded-full px-3 py-1.5 text-xs font-semibold"
          style={{ background: !params.plant ? "var(--navy)" : "var(--card)", color: !params.plant ? "white" : "var(--muted)", border: "1px solid #ede8e0" }}
        >
          All
        </Link>
        {plants.map(p => (
          <Link
            key={p.id}
            href={`/app/care-log?plant=${p.id}`}
            className="rounded-full px-3 py-1.5 text-xs font-semibold"
            style={{ background: params.plant === p.id ? "var(--navy)" : "var(--card)", color: params.plant === p.id ? "white" : "var(--muted)", border: "1px solid #ede8e0" }}
          >
            {p.name}
          </Link>
        ))}
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#9ca3af" }}>Type</span>
        <Link
          href={params.plant ? `/app/care-log?plant=${params.plant}` : "/app/care-log"}
          className="rounded-full px-3 py-1.5 text-xs font-semibold"
          style={{ background: !params.type ? "var(--orange)" : "var(--card)", color: !params.type ? "white" : "var(--muted)", border: "1px solid #ede8e0" }}
        >
          All
        </Link>
        {(Object.keys(CARE_META) as CareType[]).map(type => (
          <Link
            key={type}
            href={`/app/care-log?type=${type}${params.plant ? `&plant=${params.plant}` : ""}`}
            className="flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold"
            style={{ background: params.type === type ? "var(--orange)" : "var(--card)", color: params.type === type ? "white" : "var(--muted)", border: "1px solid #ede8e0" }}
          >
            {CARE_META[type].emoji} {CARE_META[type].label}
          </Link>
        ))}
      </div>

      {/* Timeline */}
      {entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl py-24 text-center" style={{ background: "var(--card)", border: "2px dashed #ddd5c8" }}>
          <div className="mb-3 text-5xl">📋</div>
          <p className="font-semibold" style={{ color: "var(--text)" }}>No care logged yet</p>
          <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>Visit a plant's page to log watering, fertilizing, and more.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {[...grouped.entries()].map(([day, dayEntries]) => (
            <div key={day}>
              <p className="mb-2 text-xs font-bold uppercase tracking-widest" style={{ color: "#9ca3af" }}>{day}</p>
              <div className="space-y-2">
                {dayEntries.map(entry => {
                  const meta = CARE_META[entry.type];
                  return (
                    <div key={entry.id} className="group flex items-center gap-3 rounded-xl px-4 py-3" style={{ background: "var(--card)", border: "1px solid #ede8e0" }}>
                      <span className="text-lg">{meta.emoji}</span>
                      <div className="flex-1">
                        <p className="text-sm" style={{ color: "var(--text)" }}>
                          <span className="font-medium">{meta.label}</span>
                          {entry.plants && (
                            <>
                              {" "}·{" "}
                              <Link href={`/app/plants/${entry.plants.id}`} className="hover:underline" style={{ color: "var(--orange)" }}>
                                {entry.plants.name}
                              </Link>
                            </>
                          )}
                        </p>
                        {entry.note && <p className="text-xs" style={{ color: "var(--muted)" }}>{entry.note}</p>}
                      </div>
                      <p className="text-xs" style={{ color: "#9ca3af" }}>
                        {new Date(entry.logged_at).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                      </p>
                      <form action={deleteCareEntry.bind(null, entry.id, entry.plants?.id ?? "")}>
                        <button type="submit" className="hidden text-xs group-hover:block" style={{ color: "#d1d5db" }}>✕</button>
                      </form>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
