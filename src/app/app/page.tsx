import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import Greeting from "@/components/Greeting";

type PlantRow = {
  id: string; name: string; species: string | null; room: string | null;
  plant_tags: { tag: string }[];
  photos: { id: string; taken_at: string }[];
};

export default async function LibraryPage({
  searchParams,
}: {
  searchParams: Promise<{ group?: string; tag?: string; q?: string }>;
}) {
  const supabase = await createClient();
  const params = await searchParams;
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profileRaw } = await supabase
    .from("profiles").select("display_name, username").eq("id", user!.id).single();
  const profile = profileRaw as { display_name: string | null; username: string | null } | null;
  const displayName = profile?.display_name ?? profile?.username ?? null;

  const { data: plantsRaw } = await supabase
    .from("plants")
    .select("*, plant_tags(tag), photos(id, taken_at)")
    .order("created_at", { ascending: false });
  const plants = (plantsRaw ?? []) as PlantRow[];

  const q = params.q?.toLowerCase() ?? "";
  const filtered = plants.filter(p => {
    if (params.tag && !p.plant_tags.some(t => t.tag === params.tag)) return false;
    if (q && !p.name.toLowerCase().includes(q) && !(p.species ?? "").toLowerCase().includes(q) && !(p.room ?? "").toLowerCase().includes(q)) return false;
    return true;
  });

  const groupBy = params.group;
  let groups: { label: string; plants: PlantRow[] }[] = [];
  if (groupBy === "room") {
    const rooms = [...new Set(filtered.map(p => p.room ?? "No room"))];
    groups = rooms.map(r => ({ label: r, plants: filtered.filter(p => (p.room ?? "No room") === r) }));
  } else {
    groups = [{ label: "all", plants: filtered }];
  }

  const allTags = [...new Set(plants.flatMap(p => p.plant_tags.map(t => t.tag)))];
  const rooms = [...new Set(plants.map(p => p.room).filter(Boolean))];

  return (
    <div>
      {/* Top bar */}
      <div className="sticky top-0 z-10 flex items-center gap-4 border-b px-8 py-3" style={{ background: "var(--cream)", borderColor: "#ddd5c8" }}>
        <div className="flex-1">
          <Greeting name={displayName} />
          <h1 className="text-xl font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--text)" }}>Your library</h1>
        </div>
        <form method="GET" action="/app">
          <div className="flex items-center gap-2 rounded-xl border bg-white px-4 py-2.5 shadow-sm" style={{ borderColor: "#e0d9d0" }}>
            <svg className="h-4 w-4 shrink-0 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              name="q"
              defaultValue={params.q ?? ""}
              placeholder="Search plants, rooms, tags…"
              className="w-48 bg-transparent text-sm outline-none placeholder:text-stone-400"
            />
            {params.group && <input type="hidden" name="group" value={params.group} />}
          </div>
        </form>
      </div>

      <div className="px-8 py-6">
        {/* Stats */}
        {plants.length > 0 && (
          <div className="mb-6 grid grid-cols-3 gap-3">
            {[
              { label: "Total plants", value: plants.length, emoji: "🪴" },
              { label: "Rooms", value: rooms.length, emoji: "🏠" },
              { label: "Tags", value: allTags.length, emoji: "🏷️" },
            ].map(({ label, value, emoji }) => (
              <div key={label} className="flex items-center gap-3 rounded-2xl p-4 shadow-sm" style={{ background: "var(--card)", border: "1px solid #ede8e0" }}>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xl" style={{ background: "var(--cream)" }}>{emoji}</div>
                <div>
                  <p className="text-2xl font-bold leading-none" style={{ color: "var(--text)" }}>{value}</p>
                  <p className="mt-0.5 text-xs" style={{ color: "var(--muted)" }}>{label}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Filters */}
        <div className="mb-5 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#9ca3af" }}>View</span>
          {[
            { label: "All", href: "/app", active: !groupBy && !params.tag },
            { label: "By Room", href: "/app?group=room", active: groupBy === "room" },
          ].map(({ label, href, active }) => (
            <Link
              key={label}
              href={href}
              className="rounded-full px-4 py-1.5 text-xs font-semibold transition-all"
              style={{
                background: active ? "var(--navy)" : "var(--card)",
                color: active ? "white" : "var(--muted)",
                border: `1px solid ${active ? "var(--navy)" : "#ede8e0"}`,
                boxShadow: active ? "none" : "0 1px 2px rgba(0,0,0,0.04)",
              }}
            >
              {label}
            </Link>
          ))}

          {allTags.length > 0 && (
            <>
              <span className="ml-1 text-xs font-semibold uppercase tracking-wider" style={{ color: "#9ca3af" }}>Tags</span>
              {params.tag && (
                <Link
                  href="/app"
                  className="flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold"
                  style={{ background: "var(--orange-light)", color: "var(--orange)", border: "1px solid #fed7aa" }}
                >
                  ✕ {params.tag}
                </Link>
              )}
              {allTags.filter(t => t !== params.tag).map(tag => (
                <Link
                  key={tag}
                  href={`/app?tag=${encodeURIComponent(tag)}`}
                  className="rounded-full px-3 py-1.5 text-xs font-medium transition-colors hover:bg-stone-100"
                  style={{ background: "var(--card)", color: "var(--muted)", border: "1px solid #ede8e0" }}
                >
                  #{tag}
                </Link>
              ))}
            </>
          )}

          <span className="ml-auto text-xs" style={{ color: "var(--muted)" }}>
            {filtered.length} / {plants.length}
          </span>
        </div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-3xl py-32 text-center" style={{ background: "var(--card)", border: "2px dashed #ddd5c8" }}>
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-3xl text-4xl" style={{ background: "var(--cream)" }}>🪴</div>
            <p className="text-lg font-bold" style={{ color: "var(--text)" }}>No plants yet</p>
            <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>Add your first plant to start your collection</p>
            <Link
              href="/app/plants/new"
              className="mt-6 rounded-xl px-6 py-3 text-sm font-bold text-white shadow-md transition-all hover:opacity-90 active:scale-95"
              style={{ background: "var(--orange)", boxShadow: "0 4px 12px rgba(249,115,22,0.35)" }}
            >
              + Add a plant
            </Link>
          </div>
        )}

        {/* Plant grid */}
        {groups.map(({ label, plants: groupPlants }) => (
          <div key={label}>
            {groupBy && (
              <div className="mb-4 mt-8 flex items-center gap-3">
                <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--muted)" }}>{label}</span>
                <span className="h-px flex-1" style={{ background: "#ddd5c8" }} />
                <span className="text-xs" style={{ color: "#9ca3af" }}>{groupPlants.length}</span>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {groupPlants.map(plant => {
                const cover = plant.photos?.sort(
                  (a, b) => new Date(b.taken_at).getTime() - new Date(a.taken_at).getTime()
                )[0];
                return (
                  <Link
                    key={plant.id}
                    href={`/app/plants/${plant.id}`}
                    className="group overflow-hidden rounded-2xl shadow-sm transition-all duration-200 hover:shadow-lg hover:-translate-y-1"
                    style={{ background: "var(--card)", border: "1px solid #ede8e0" }}
                  >
                    <div className="relative flex h-44 items-center justify-center overflow-hidden" style={{ background: "#ede8e0" }}>
                      {cover ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={`/api/photos/${cover.id}`}
                          alt={plant.name}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <span className="text-5xl opacity-60">🌱</span>
                      )}
                    </div>
                    <div className="p-3.5">
                      <p className="font-semibold truncate" style={{ color: "var(--text)" }}>{plant.name}</p>
                      {plant.species && (
                        <p className="mt-0.5 truncate text-xs italic" style={{ color: "var(--muted)" }}>{plant.species}</p>
                      )}
                      {plant.room && (
                        <p className="mt-1.5 flex items-center gap-1 text-xs" style={{ color: "var(--muted)" }}>
                          📍 {plant.room}
                        </p>
                      )}
                      {plant.plant_tags.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {plant.plant_tags.slice(0, 3).map(t => (
                            <span
                              key={t.tag}
                              className="rounded-full px-2 py-0.5 text-xs font-medium"
                              style={{ background: "var(--orange-light)", color: "#c2410c" }}
                            >
                              #{t.tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
