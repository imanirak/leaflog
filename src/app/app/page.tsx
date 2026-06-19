import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import AddPlantButton from "@/components/AddPlantButton";

export default async function LibraryPage({
  searchParams,
}: {
  searchParams: Promise<{ room?: string; tag?: string }>;
}) {
  const supabase = await createClient();
  const params = await searchParams;

  type PlantRow = {
    id: string; name: string; species: string | null; room: string | null;
    plant_tags: { tag: string }[];
    photos: { id: string; storage_path: string; taken_at: string }[];
  };
  const { data: plantsRaw } = await supabase
    .from("plants")
    .select("*, plant_tags(tag), photos(id, storage_path, taken_at)")
    .order("created_at", { ascending: false });
  const plants = (plantsRaw ?? []) as PlantRow[];

  // Get distinct rooms and tags for filter UI
  const rooms = [...new Set(plants.map(p => p.room).filter(Boolean))];
  const allTags = [...new Set(plants.flatMap(p => p.plant_tags.map(t => t.tag)))];

  const filtered = plants.filter(p => {
    if (params.room && p.room !== params.room) return false;
    if (params.tag && !p.plant_tags.some((t: { tag: string }) => t.tag === params.tag)) return false;
    return true;
  });

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-stone-900">My plants</h1>
        <AddPlantButton />
      </div>

      {/* Filters */}
      {(rooms.length > 0 || allTags.length > 0) && (
        <div className="mb-6 flex flex-wrap gap-2">
          <Link
            href="/app"
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              !params.room && !params.tag
                ? "bg-green-700 text-white"
                : "bg-stone-100 text-stone-600 hover:bg-stone-200"
            }`}
          >
            All
          </Link>
          {rooms.map(room => (
            <Link
              key={room}
              href={`/app?room=${encodeURIComponent(room!)}`}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                params.room === room
                  ? "bg-green-700 text-white"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200"
              }`}
            >
              📍 {room}
            </Link>
          ))}
          {allTags.map(tag => (
            <Link
              key={tag}
              href={`/app?tag=${encodeURIComponent(tag)}`}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                params.tag === tag
                  ? "bg-green-700 text-white"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200"
              }`}
            >
              # {tag}
            </Link>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="mb-3 text-5xl">🪴</div>
          <p className="text-stone-500">No plants yet. Add your first one!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map(plant => {
            const cover = plant.photos?.sort(
              (a: { taken_at: string }, b: { taken_at: string }) =>
                new Date(b.taken_at).getTime() - new Date(a.taken_at).getTime()
            )[0];

            return (
              <Link
                key={plant.id}
                href={`/app/plants/${plant.id}`}
                className="group overflow-hidden rounded-2xl border border-stone-200 bg-white transition-shadow hover:shadow-md"
              >
                <div className="flex h-40 items-center justify-center bg-stone-100">
                  {cover ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={`/api/photos/${cover.id}`}
                      alt={plant.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-4xl">🌱</span>
                  )}
                </div>
                <div className="p-3">
                  <p className="font-medium text-stone-900 group-hover:text-green-700">{plant.name}</p>
                  {plant.species && <p className="mt-0.5 text-xs italic text-stone-400">{plant.species}</p>}
                  {plant.room && <p className="mt-1 text-xs text-stone-400">📍 {plant.room}</p>}
                  {plant.plant_tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {plant.plant_tags.slice(0, 3).map((t: { tag: string }) => (
                        <span key={t.tag} className="rounded-full bg-green-50 px-2 py-0.5 text-xs text-green-700">
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
      )}
    </div>
  );
}
