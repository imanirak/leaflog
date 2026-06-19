import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { addCollection } from "@/lib/collectionActions";

export default async function CollectionsPage() {
  const supabase = await createClient();

  type CollectionRow = { id: string; name: string; plant_collections: { plant_id: string }[] };
  const { data: collectionsRaw } = await supabase
    .from("collections")
    .select("*, plant_collections(plant_id)")
    .order("created_at", { ascending: false });
  const collections = (collectionsRaw ?? []) as CollectionRow[];

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-stone-900">Collections</h1>
      </div>

      <form action={addCollection} className="mb-8 flex gap-2">
        <input
          name="name"
          required
          placeholder="New collection name…"
          className="flex-1 max-w-xs rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
        />
        <button
          type="submit"
          className="rounded-xl bg-green-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-800"
        >
          Create
        </button>
      </form>

      {collections && collections.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {collections.map(col => (
            <Link
              key={col.id}
              href={`/app/collections/${col.id}`}
              className="rounded-2xl border border-stone-200 bg-white p-5 transition-shadow hover:shadow-md"
            >
              <div className="mb-2 text-3xl">📁</div>
              <p className="font-medium text-stone-900">{col.name}</p>
              <p className="mt-1 text-sm text-stone-400">
                {col.plant_collections.length} plant{col.plant_collections.length !== 1 ? "s" : ""}
              </p>
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="mb-3 text-5xl">📁</div>
          <p className="text-stone-500">No collections yet. Create one above.</p>
        </div>
      )}
    </div>
  );
}
