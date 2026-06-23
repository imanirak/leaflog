import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import AddPlantForm from "@/components/AddPlantForm";
import { removePlantFromCollection, deleteCollection } from "@/lib/collectionActions";

export default async function CollectionPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { id } = await params;

  const { data: collectionRaw } = await supabase
    .from("collections")
    .select("*")
    .eq("id", id)
    .single();

  const collection = collectionRaw as { id: string; name: string } | null;
  if (!collection) notFound();

  const { data: membersRaw } = await supabase
    .from("plant_collections")
    .select("plant_id, plants(id, name, species, room)")
    .eq("collection_id", id);

  type MemberRow = {
    plant_id: string;
    plants: { id: string; name: string; species: string | null; room: string | null } | null;
  };
  const members = (membersRaw ?? []) as unknown as MemberRow[];

  const { data: allPlantsRaw } = await supabase
    .from("plants")
    .select("id, name")
    .order("name");

  const allPlants = (allPlantsRaw ?? []) as Array<{ id: string; name: string }>;
  const memberIds = new Set(members.map(m => m.plant_id));
  const nonMembers = allPlants.filter(p => !memberIds.has(p.id));
  const deleteAction = deleteCollection.bind(null, id);

  return (
    <div className="mx-auto max-w-3xl p-8">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <Link href="/app/collections" className="mb-3 inline-flex items-center gap-1 text-sm" style={{ color: "var(--muted)" }}>
            <span aria-hidden="true">←</span> Collections
          </Link>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text)", fontFamily: "var(--font-display)" }}>{collection.name}</h1>
          <p className="text-sm" style={{ color: "var(--muted)" }}>{memberIds.size} plant{memberIds.size !== 1 ? "s" : ""}</p>
        </div>
        <form action={deleteAction}>
          <button
            type="submit"
            aria-label={`Delete collection "${collection.name}"`}
            className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
          >
            Delete collection
          </button>
        </form>
      </div>

      {nonMembers.length > 0 && (
        <div className="mb-6">
          <AddPlantForm collectionId={id} plants={nonMembers} />
        </div>
      )}

      {members && members.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {members.map(m => {
            const plant = m.plants;
            if (!plant) return null;
            const removeAction = removePlantFromCollection.bind(null, id, plant.id);
            return (
              <div key={plant.id} className="group rounded-2xl p-4" style={{ background: "var(--card)", border: "1px solid #d9e8de" }}>
                <Link href={`/app/plants/${plant.id}`} className="block">
                  <div className="mb-1 text-2xl" aria-hidden="true">🌱</div>
                  <p className="font-semibold transition-colors" style={{ color: "var(--text)" }}>{plant.name}</p>
                  {plant.species && <p className="mt-0.5 text-xs italic" style={{ color: "var(--muted)" }}>{plant.species}</p>}
                  {plant.room && <p className="mt-1 text-xs" style={{ color: "var(--muted)" }}><span aria-hidden="true">📍</span> {plant.room}</p>}
                </Link>
                <form action={removeAction} className="mt-3">
                  <button
                    type="submit"
                    aria-label={`Remove ${plant.name} from ${collection.name}`}
                    className="rounded-md px-1.5 py-1 text-xs font-medium transition-colors hover:bg-red-50 hover:text-red-600"
                    style={{ color: "var(--muted)" }}
                  >
                    Remove
                  </button>
                </form>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-sm" style={{ color: "var(--muted)" }}>No plants in this collection yet.</p>
      )}
    </div>
  );
}
