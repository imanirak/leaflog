import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { updatePlant } from "@/lib/actions";

const inputClass = "w-full rounded-xl border bg-white px-4 py-2.5 text-sm outline-none transition-colors focus:border-orange-400";
const inputStyle = { borderColor: "#ddd5c8" };

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
      <Link href={`/app/plants/${id}`} className="mb-6 inline-flex items-center gap-1 text-sm" style={{ color: "var(--muted)" }}>
        ← Back
      </Link>
      <h1 className="mb-6 text-2xl font-bold" style={{ color: "var(--text)", fontFamily: "var(--font-display)" }}>Edit plant</h1>
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
            className="rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
            style={{ background: "var(--orange)" }}
          >
            Save changes
          </button>
          <Link
            href={`/app/plants/${id}`}
            className="rounded-xl border px-5 py-2.5 text-sm hover:bg-stone-50"
            style={{ borderColor: "#ddd5c8", color: "var(--text)" }}
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
        <label className="mb-1.5 block text-sm font-medium" style={{ color: "var(--text)" }}>Name *</label>
        <input name="name" required defaultValue={defaults.name} className={inputClass} style={inputStyle} />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium" style={{ color: "var(--text)" }}>Species</label>
        <input name="species" defaultValue={defaults.species} placeholder="e.g. Monstera deliciosa" className={inputClass} style={inputStyle} />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium" style={{ color: "var(--text)" }}>Room / location</label>
        <input name="room" defaultValue={defaults.room} placeholder="e.g. Living room" className={inputClass} style={inputStyle} />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium" style={{ color: "var(--text)" }}>Date acquired</label>
        <input type="date" name="date_acquired" defaultValue={defaults.date_acquired} className={inputClass} style={inputStyle} />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium" style={{ color: "var(--text)" }}>Tags</label>
        <input name="tags" defaultValue={defaults.tags} placeholder="tropical, low-light, propagated" className={inputClass} style={inputStyle} />
        <p className="mt-1 text-xs" style={{ color: "var(--muted)" }}>Comma-separated</p>
      </div>
    </>
  );
}
