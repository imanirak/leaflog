import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { updatePlant } from "@/lib/actions";

export default async function EditPlantPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { id } = await params;

  type PlantWithTags = {
    name: string; species: string | null; room: string | null; date_acquired: string | null;
    plant_tags: { tag: string }[];
  };
  const { data: plantRaw } = await supabase
    .from("plants")
    .select("*, plant_tags(tag)")
    .eq("id", id)
    .single();

  const plant = plantRaw as PlantWithTags | null;
  if (!plant) notFound();

  const tags = plant.plant_tags.map(t => t.tag).join(", ");
  const action = updatePlant.bind(null, id);

  return (
    <div className="mx-auto max-w-lg p-8">
      <Link href={`/app/plants/${id}`} className="mb-6 inline-flex items-center gap-1 text-sm text-stone-400 hover:text-stone-600">
        ← Back
      </Link>
      <h1 className="mb-6 text-2xl font-semibold text-stone-900">Edit plant</h1>
      <form action={action} className="space-y-5">
        <PlantFields
          defaults={{
            name: plant.name,
            species: plant.species ?? "",
            room: plant.room ?? "",
            date_acquired: plant.date_acquired ?? "",
            tags,
          }}
        />
        <div className="flex gap-3">
          <button
            type="submit"
            className="rounded-xl bg-green-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-green-800"
          >
            Save changes
          </button>
          <Link
            href={`/app/plants/${id}`}
            className="rounded-xl border border-stone-200 px-5 py-2.5 text-sm text-stone-600 hover:bg-stone-50"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

function PlantFields({ defaults }: { defaults: { name: string; species: string; room: string; date_acquired: string; tags: string } }) {
  return (
    <>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-stone-700">Name *</label>
        <input
          name="name"
          required
          defaultValue={defaults.name}
          className="w-full rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-stone-700">Species</label>
        <input
          name="species"
          defaultValue={defaults.species}
          placeholder="e.g. Monstera deliciosa"
          className="w-full rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-stone-700">Room / location</label>
        <input
          name="room"
          defaultValue={defaults.room}
          placeholder="e.g. Living room"
          className="w-full rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-stone-700">Date acquired</label>
        <input
          type="date"
          name="date_acquired"
          defaultValue={defaults.date_acquired}
          className="w-full rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-stone-700">Tags</label>
        <input
          name="tags"
          defaultValue={defaults.tags}
          placeholder="tropical, low-light, propagated"
          className="w-full rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
        />
        <p className="mt-1 text-xs text-stone-400">Comma-separated</p>
      </div>
    </>
  );
}
