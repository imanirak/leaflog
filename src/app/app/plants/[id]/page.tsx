import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import NoteForm from "@/components/NoteForm";
import PhotoUpload from "@/components/PhotoUpload";
import DeletePlantButton from "@/components/DeletePlantButton";
import { deleteNote, deletePhoto } from "@/lib/actions";
import { sharePhoto, unsharePhoto } from "@/lib/profileActions";

export default async function PlantDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { id } = await params;

  type PlantWithTags = {
    id: string; name: string; species: string | null; room: string | null; date_acquired: string | null;
    plant_tags: { tag: string }[];
  };
  type PhotoRow = { id: string; storage_path: string; caption: string | null; taken_at: string; is_shared: boolean };
  type NoteRow = { id: string; body: string; created_at: string };

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

  const tags = plant.plant_tags.map(t => t.tag);

  return (
    <div className="mx-auto max-w-3xl p-8">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <Link href="/app" className="mb-3 inline-flex items-center gap-1 text-sm text-stone-400 hover:text-stone-600">
            ← All plants
          </Link>
          <h1 className="text-3xl font-semibold text-stone-900">{plant.name}</h1>
          {plant.species && <p className="mt-1 italic text-stone-500">{plant.species}</p>}
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-stone-400">
            {plant.room && <span>📍 {plant.room}</span>}
            {plant.date_acquired && (
              <span>Added {new Date(plant.date_acquired).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
            )}
          </div>
          {tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {tags.map((tag: string) => (
                <span key={tag} className="rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/app/plants/${id}/edit`}
            className="rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-sm text-stone-600 hover:bg-stone-50"
          >
            Edit
          </Link>
          <DeletePlantButton plantId={id} />
        </div>
      </div>

      {/* Photos */}
      <section className="mb-10">
        <h2 className="mb-4 text-lg font-semibold text-stone-800">Photos</h2>
        <PhotoUpload plantId={id} />
        {photos && photos.length > 0 ? (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {photos.map((photo: PhotoRow) => (
              <div key={photo.id} className="group relative overflow-hidden rounded-xl bg-stone-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/api/photos/${photo.id}`}
                  alt={photo.caption ?? plant.name}
                  className="h-40 w-full object-cover"
                />
                {photo.is_shared && (
                  <div className="absolute right-2 top-2 rounded-full bg-green-600 px-2 py-0.5 text-xs text-white">
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
                        <button type="submit" className="text-xs text-green-300 hover:text-green-100">
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
                <p className="px-2 py-1 text-xs text-stone-400">
                  {new Date(photo.taken_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-stone-400">No photos yet.</p>
        )}
      </section>

      {/* Notes */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-stone-800">Notes</h2>
        <NoteForm plantId={id} />
        {notes && notes.length > 0 ? (
          <div className="mt-4 space-y-3">
            {notes.map((note: NoteRow) => (
              <div key={note.id} className="group rounded-xl border border-stone-200 bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <p className="flex-1 whitespace-pre-wrap text-sm text-stone-700">{note.body}</p>
                  <form action={deleteNote.bind(null, note.id, id)}>
                    <button type="submit" className="hidden text-xs text-stone-300 hover:text-red-500 group-hover:block">
                      ✕
                    </button>
                  </form>
                </div>
                <p className="mt-2 text-xs text-stone-400">
                  {new Date(note.created_at).toLocaleDateString("en-US", {
                    year: "numeric", month: "short", day: "numeric",
                  })}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-stone-400">No notes yet.</p>
        )}
      </section>
    </div>
  );
}
