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
        <h1 className="text-2xl font-bold" style={{ color: "var(--text)", fontFamily: "var(--font-display)" }}>Collections</h1>
      </div>

      <form action={addCollection} className="mb-8 flex gap-2">
        <input
          name="name"
          required
          placeholder="New collection name…"
          className="flex-1 max-w-xs rounded-xl border bg-white px-4 py-2.5 text-sm outline-none focus:border-orange-400"
          style={{ borderColor: "#ddd5c8" }}
        />
        <button
          type="submit"
          className="rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:opacity-90"
          style={{ background: "var(--orange)" }}
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
              className="rounded-2xl p-5 shadow-sm transition-shadow hover:shadow-md"
              style={{ background: "var(--card)", border: "1px solid #ede8e0" }}
            >
              <div className="mb-2 text-3xl">📁</div>
              <p className="font-semibold" style={{ color: "var(--text)" }}>{col.name}</p>
              <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
                {col.plant_collections.length} plant{col.plant_collections.length !== 1 ? "s" : ""}
              </p>
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-3xl py-24 text-center" style={{ background: "var(--card)", border: "2px dashed #ddd5c8" }}>
          <div className="mb-3 text-5xl">📁</div>
          <p style={{ color: "var(--muted)" }}>No collections yet. Create one above.</p>
        </div>
      )}
    </div>
  );
}
