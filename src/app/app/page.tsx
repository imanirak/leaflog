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
    .from("profiles")
    .select("display_name, username")
    .eq("id", user!.id)
    .single();
  const profile = profileRaw as { display_name: string | null; username: string | null } | null;

  const { data: plantsRaw } = await supabase
    .from("plants")
    .select("*, plant_tags(tag), photos(id, taken_at)")
    .order("created_at", { ascending: false });
  const plants = (plantsRaw ?? []) as PlantRow[];

  const displayName = profile?.display_name ?? profile?.username ?? null;

  // Filter
  const q = params.q?.toLowerCase() ?? "";
  let filtered = plants.filter(p => {
    if (params.tag && !p.plant_tags.some(t => t.tag === params.tag)) return false;
    if (q && !p.name.toLowerCase().includes(q) && !(p.species ?? "").toLowerCase().includes(q) && !(p.room ?? "").toLowerCase().includes(q)) return false;
    return true;
  });

  // Group
  const groupBy = params.group;
  let groups: { label: string; plants: PlantRow[] }[] = [];
  if (groupBy === "room") {
    const rooms = [...new Set(filtered.map(p => p.room ?? "No room"))];
    groups = rooms.map(r => ({ label: r, plants: filtered.filter(p => (p.room ?? "No room") === r) }));
  } else {
    groups = [{ label: "all", plants: filtered }];
  }

  const allTags = [...new Set(plants.flatMap(p => p.plant_tags.map(t => t.tag)))];

  return (
    <div className="flex-1 p-8">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <Greeting name={displayName} />
          <h1 className="text-4xl font-semibold" style={{ fontFamily: "var(--font-display)", color: "#1c1f2e" }}>
            Your library
          </h1>
        </div>
        {/* Search */}
        <form method="GET">
          <div className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 shadow-sm border border-stone-100">
            <svg className="h-4 w-4 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              name="q"
              defaultValue={params.q ?? ""}
              placeholder="Search plants, rooms, tags"
              className="w-52 bg-transparent text-sm outline-none placeholder:text-stone-400"
            />
            {params.group && <input type="hidden" name="group" value={params.group} />}
          </div>
        </form>
      </div>

      {/* Group by tabs */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <span className="mr-2 text-xs text-stone-400">Group by</span>
          {[
            { label: "All", group: undefined },
            { label: "Room", group: "room" },
            { label: "Collection", group: "collection" },
          ].map(({ label, group }) => {
            const active = (group === undefined && !groupBy) || groupBy === group;
            return (
              <Link
                key={label}
                href={group ? `/app?group=${group}` : "/app"}
                className="rounded-full px-4 py-1.5 text-sm font-medium transition-colors"
                style={{
                  background: active ? "#1c1f2e" : "white",
                  color: active ? "white" : "#6b7280",
                  border: active ? "none" : "1px solid #e5e7eb",
                }}
              >
                {label}
              </Link>
            );
          })}
        </div>
        <p className="text-sm" style={{ color: "#8a8070" }}>{filtered.length} of {plants.length}</p>
      </div>

      {/* Tag filters */}
      {allTags.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          {params.tag && (
            <Link href="/app" className="rounded-full border border-stone-200 bg-white px-3 py-1 text-xs text-stone-500 hover:bg-stone-50">
              ✕ Clear
            </Link>
          )}
          {allTags.map(tag => (
            <Link
              key={tag}
              href={`/app?tag=${encodeURIComponent(tag)}`}
              className="rounded-full px-3 py-1 text-xs font-medium transition-colors"
              style={{
                background: params.tag === tag ? "#1c1f2e" : "white",
                color: params.tag === tag ? "white" : "#6b7280",
                border: "1px solid #e5e7eb",
              }}
            >
              #{tag}
            </Link>
          ))}
        </div>
      )}

      {/* Plant grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <div className="mb-4 text-6xl">🪴</div>
          <p className="text-lg font-medium" style={{ color: "#1c1f2e" }}>No plants yet</p>
          <p className="mt-1 text-sm text-stone-400">Add your first plant to get started</p>
          <Link
            href="/app/plants/new"
            className="mt-6 rounded-xl px-6 py-3 text-sm font-semibold text-white"
            style={{ background: "var(--orange)" }}
          >
            + Add a plant
          </Link>
        </div>
      ) : (
        groups.map(({ label, plants: groupPlants }) => (
          <div key={label}>
            {groupBy && (
              <h2 className="mb-3 mt-6 text-sm font-semibold uppercase tracking-wider text-stone-400">{label}</h2>
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
                    className="group overflow-hidden rounded-2xl bg-white shadow-sm transition-shadow hover:shadow-md"
                  >
                    <div className="flex h-44 items-center justify-center overflow-hidden" style={{ background: "#f5f0ea" }}>
                      {cover ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={`/api/photos/${cover.id}`}
                          alt={plant.name}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                      ) : (
                        <span className="text-5xl">🌱</span>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="font-semibold text-stone-900 group-hover:text-orange-500 transition-colors">{plant.name}</p>
                      {plant.species && <p className="mt-0.5 text-xs italic text-stone-400">{plant.species}</p>}
                      {plant.room && <p className="mt-1 text-xs text-stone-400">📍 {plant.room}</p>}
                      {plant.plant_tags.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {plant.plant_tags.slice(0, 3).map(t => (
                            <span key={t.tag} className="rounded-full px-2 py-0.5 text-xs" style={{ background: "#fff0e6", color: "#c2410c" }}>
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
        ))
      )}
    </div>
  );
}
