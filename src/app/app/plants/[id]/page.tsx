import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import NoteForm from "@/components/NoteForm";
import PhotoUpload from "@/components/PhotoUpload";
import DeletePlantButton from "@/components/DeletePlantButton";
import QuickLogCare from "@/components/QuickLogCare";
import { deleteNote, deletePhoto } from "@/lib/actions";
import { sharePhoto, unsharePhoto } from "@/lib/profileActions";
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

export default async function PlantDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { id } = await params;

  type PlantWithTags = {
    id: string; name: string; species: string | null; room: string | null; date_acquired: string | null;
    plant_tags: { tag: string }[];
  };
  type PhotoRow = { id: string; storage_path: string; caption: string | null; taken_at: string; is_shared: boolean };
  type NoteRow = { id: string; body: string; created_at: string };
  type CareEntry = { id: string; type: CareType; note: string | null; logged_at: string };

  const { data: plantRaw } = await supabase
    .from("plants")
    .select("*, plant_tags(tag)")
    .eq("id", id)
    .single();

  const plant = plantRaw as PlantWithTags | null;
  if (!plant) notFound();

  const { data: photosRaw } = await supabase
    .from("photos")
    .select("*")
    .eq("plant_id", id)
    .order("taken_at", { ascending: false });
  const photos = (photosRaw ?? []) as PhotoRow[];

  const { data: notesRaw } = await supabase
    .from("notes")
    .select("*")
    .eq("plant_id", id)
    .order("created_at", { ascending: false });
  const notes = (notesRaw ?? []) as NoteRow[];

  const { data: careRaw } = await supabase
    .from("care_log_entries")
    .select("*")
    .eq("plant_id", id)
    .order("logged_at", { ascending: false })
    .limit(10);
  const careEntries = (careRaw ?? []) as CareEntry[];

  const lastWatered = careEntries.find(c => c.type === "watered");
  const daysSinceWatered = lastWatered
    ? Math.floor((Date.now() - new Date(lastWatered.logged_at).getTime()) / (1000 * 60 * 60 * 24))
    : null;

  const tags = plant.plant_tags.map(t => t.tag);

  return (
    <div className="mx-auto max-w-3xl p-8">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <Link href="/app" className="mb-3 inline-flex items-center gap-1 text-sm" style={{ color: "var(--muted)" }}>
            ← All plants
          </Link>
          <h1 className="text-3xl font-bold" style={{ color: "var(--text)", fontFamily: "var(--font-display)" }}>{plant.name}</h1>
          {plant.species && <p className="mt-1 italic text-sm" style={{ color: "var(--muted)" }}>{plant.species}</p>}
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm" style={{ color: "var(--muted)" }}>
            {plant.room && <span>📍 {plant.room}</span>}
            {plant.date_acquired && (
              <span>Added {new Date(plant.date_acquired).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
            )}
          </div>
          {tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {tags.map((tag: string) => (
                <span key={tag} className="rounded-full px-2.5 py-0.5 text-xs font-medium" style={{ background: "var(--orange-light)", color: "#c2410c" }}>
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/app/plants/${id}/edit`}
            className="rounded-lg border px-3 py-1.5 text-sm transition-colors hover:bg-stone-50"
            style={{ borderColor: "#ede8e0", color: "var(--text)" }}
          >
            Edit
          </Link>
          <DeletePlantButton plantId={id} />
        </div>
      </div>

      {/* Watering status */}
      {daysSinceWatered !== null && (
        <div
          className="mb-6 flex items-center gap-3 rounded-2xl px-4 py-3"
          style={{
            background: daysSinceWatered >= 7 ? "#fef2f2" : "var(--card)",
            border: `1px solid ${daysSinceWatered >= 7 ? "#fecaca" : "#ede8e0"}`,
          }}
        >
          <span className="text-xl">💧</span>
          <p className="text-sm" style={{ color: daysSinceWatered >= 7 ? "#b91c1c" : "var(--muted)" }}>
            {daysSinceWatered === 0 ? "Watered today" : `Last watered ${daysSinceWatered} day${daysSinceWatered !== 1 ? "s" : ""} ago`}
            {daysSinceWatered >= 7 && " — might need water soon"}
          </p>
        </div>
      )}

      {/* Care log quick actions */}
      <section className="mb-8">
        <h2 className="mb-3 text-lg font-semibold" style={{ color: "var(--text)" }}>Log care</h2>
        <QuickLogCare plantId={id} />

        {careEntries.length > 0 && (
          <div className="mt-4 space-y-2">
            {careEntries.slice(0, 5).map(entry => {
              const meta = CARE_META[entry.type];
              return (
                <div key={entry.id} className="group flex items-center gap-3 rounded-xl px-3 py-2" style={{ background: "var(--card)", border: "1px solid #ede8e0" }}>
                  <span className="text-base">{meta.emoji}</span>
                  <p className="flex-1 text-sm" style={{ color: "var(--text)" }}>{meta.label}</p>
                  <p className="text-xs" style={{ color: "#9ca3af" }}>
                    {new Date(entry.logged_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </p>
                  <form action={deleteCareEntry.bind(null, entry.id, id)}>
                    <button type="submit" className="hidden text-xs group-hover:block" style={{ color: "#d1d5db" }}>✕</button>
                  </form>
                </div>
              );
            })}
            {careEntries.length > 5 && (
              <Link href={`/app/care-log?plant=${id}`} className="block text-center text-xs font-medium hover:underline" style={{ color: "var(--orange)" }}>
                View full care history →
              </Link>
            )}
          </div>
        )}
      </section>

      {/* Photos */}
      <section className="mb-10">
        <h2 className="mb-4 text-lg font-semibold" style={{ color: "var(--text)" }}>Photos</h2>
        <PhotoUpload plantId={id} />
        {photos && photos.length > 0 ? (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {photos.map((photo: PhotoRow) => (
              <div key={photo.id} className="group relative overflow-hidden rounded-xl" style={{ background: "#ede8e0" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/api/photos/${photo.id}`}
                  alt={photo.caption ?? plant.name}
                  className="h-40 w-full object-cover"
                />
                {photo.is_shared && (
                  <div className="absolute right-2 top-2 rounded-full px-2 py-0.5 text-xs text-white" style={{ background: "var(--orange)" }}>
                    Shared
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 hidden bg-gradient-to-t from-black/70 p-2 group-hover:block">
                  <div className="flex items-end justify-between gap-1">
                    {photo.caption && <p className="text-xs text-white">{photo.caption}</p>}
                    <div className="ml-auto flex gap-2">
                      <form action={photo.is_shared
                        ? unsharePhoto.bind(null, photo.id, id)
                        : sharePhoto.bind(null, photo.id, id)
                      }>
                        <button type="submit" className="text-xs text-orange-300 hover:text-orange-100">
                          {photo.is_shared ? "Unshare" : "Share"}
                        </button>
                      </form>
                      <form action={deletePhoto.bind(null, photo.id, photo.storage_path, id)}>
                        <button type="submit" className="text-xs text-red-300 hover:text-red-100">
                          Delete
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
                <p className="px-2 py-1 text-xs" style={{ color: "var(--muted)" }}>
                  {new Date(photo.taken_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm" style={{ color: "var(--muted)" }}>No photos yet.</p>
        )}
      </section>

      {/* Notes */}
      <section>
        <h2 className="mb-4 text-lg font-semibold" style={{ color: "var(--text)" }}>Notes</h2>
        <NoteForm plantId={id} />
        {notes && notes.length > 0 ? (
          <div className="mt-4 space-y-3">
            {notes.map((note: NoteRow) => (
              <div key={note.id} className="group rounded-xl p-4" style={{ background: "var(--card)", border: "1px solid #ede8e0" }}>
                <div className="flex items-start justify-between gap-3">
                  <p className="flex-1 whitespace-pre-wrap text-sm" style={{ color: "var(--text)" }}>{note.body}</p>
                  <form action={deleteNote.bind(null, note.id, id)}>
                    <button type="submit" className="hidden text-xs group-hover:block" style={{ color: "#d1d5db" }}>
                      ✕
                    </button>
                  </form>
                </div>
                <p className="mt-2 text-xs" style={{ color: "#9ca3af" }}>
                  {new Date(note.created_at).toLocaleDateString("en-US", {
                    year: "numeric", month: "short", day: "numeric",
                  })}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm" style={{ color: "var(--muted)" }}>No notes yet.</p>
        )}
      </section>
    </div>
  );
}
