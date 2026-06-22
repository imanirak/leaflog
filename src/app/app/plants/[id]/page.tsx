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

type PhotoRow = { id: string; storage_path: string; caption: string | null; taken_at: string; is_shared: boolean };
type NoteRow = { id: string; body: string; created_at: string };
type CareEntry = { id: string; type: CareType; note: string | null; logged_at: string };

type TimelineItem =
  | { kind: "photo"; date: string; photo: PhotoRow }
  | { kind: "note"; date: string; note: NoteRow };

export default async function PlantDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { id } = await params;

  type PlantWithTags = {
    id: string; name: string; species: string | null; room: string | null; date_acquired: string | null;
    plant_tags: { tag: string }[];
  };

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

  // Hero = most recent photo; oldest-first filmstrip for the growth strip
  const sortedByOldest = [...photos].sort((a, b) => new Date(a.taken_at).getTime() - new Date(b.taken_at).getTime());
  const hero = sortedByOldest[sortedByOldest.length - 1];

  // Merge photos + notes into one reverse-chronological timeline
  const timeline: TimelineItem[] = [
    ...photos.map(p => ({ kind: "photo" as const, date: p.taken_at, photo: p })),
    ...notes.map(n => ({ kind: "note" as const, date: n.created_at, note: n })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const grouped = new Map<string, TimelineItem[]>();
  for (const item of timeline) {
    const day = new Date(item.date).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
    if (!grouped.has(day)) grouped.set(day, []);
    grouped.get(day)!.push(item);
  }

  return (
    <div className="mx-auto max-w-3xl p-8">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <Link href="/app" className="mb-3 inline-flex items-center gap-1 text-sm" style={{ color: "var(--muted)" }}>
            <span aria-hidden="true">←</span> All plants
          </Link>
          <h1 className="text-3xl font-bold" style={{ color: "var(--text)", fontFamily: "var(--font-display)" }}>{plant.name}</h1>
          {plant.species && <p className="mt-1 italic text-sm" style={{ color: "var(--muted)" }}>{plant.species}</p>}
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm" style={{ color: "var(--muted)" }}>
            {plant.room && <span><span aria-hidden="true">📍</span> {plant.room}</span>}
            {plant.date_acquired && (
              <span>Added {new Date(plant.date_acquired).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
            )}
          </div>
          {tags.length > 0 && (
            <ul className="mt-3 flex flex-wrap gap-1.5">
              {tags.map((tag: string) => (
                <li key={tag} className="rounded-full px-2.5 py-0.5 text-xs font-medium" style={{ background: "var(--orange-light)", color: "var(--orange-text)" }}>
                  #{tag}
                </li>
              ))}
            </ul>
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
          <DeletePlantButton plantId={id} plantName={plant.name} />
        </div>
      </div>

      {/* Hero photo + growth filmstrip */}
      <div className="mb-6 rounded-3xl bg-white p-3 shadow-sm" style={{ border: "1px solid #ede8e0" }}>
        <div className="relative overflow-hidden rounded-2xl" style={{ background: "#ede8e0" }}>
          {hero ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`/api/photos/${hero.id}`}
              alt={`Most recent photo of ${plant.name}, taken ${new Date(hero.taken_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`}
              className="h-72 w-full object-cover"
            />
          ) : (
            <div className="flex h-72 items-center justify-center text-6xl opacity-50" role="img" aria-label={`No photos yet for ${plant.name}`}>
              <span aria-hidden="true">🌱</span>
            </div>
          )}
          {hero && (
            <div className="absolute left-3.5 top-3.5 rounded-full px-3 py-1.5 text-xs font-semibold text-white backdrop-blur" style={{ background: "rgba(28,31,46,.62)" }}>
              {plant.name}{plant.species ? ` · ${plant.species}` : ""}
            </div>
          )}
        </div>
        {photos.length > 0 && (
          <>
            <div className="mb-2.5 mt-4 flex items-center justify-between px-1">
              <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--muted)" }}>Growth timeline</p>
              <p className="text-xs" style={{ color: "var(--muted)" }}>{photos.length} check-in{photos.length !== 1 ? "s" : ""}</p>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {sortedByOldest.map((p, i) => {
                const isLast = i === sortedByOldest.length - 1;
                const dateLabel = new Date(p.taken_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
                return (
                  <a
                    key={p.id}
                    href="#timeline"
                    aria-label={`Jump to timeline entry from ${dateLabel}`}
                    className="shrink-0"
                    style={{ width: 64 }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`/api/photos/${p.id}`}
                      alt=""
                      className="h-14 w-16 rounded-lg object-cover"
                      style={{ border: isLast ? "2px solid var(--orange)" : "2px solid transparent" }}
                    />
                  </a>
                );
              })}
            </div>
          </>
        )}
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
          <span className="text-xl" aria-hidden="true">💧</span>
          <p className="text-sm" style={{ color: daysSinceWatered >= 7 ? "#b91c1c" : "var(--muted)" }}>
            {daysSinceWatered === 0 ? "Watered today" : `Last watered ${daysSinceWatered} day${daysSinceWatered !== 1 ? "s" : ""} ago`}
            {daysSinceWatered >= 7 && " — might need water soon"}
          </p>
        </div>
      )}

      {/* Care log quick actions */}
      <section className="mb-8" aria-labelledby="log-care-heading">
        <h2 id="log-care-heading" className="mb-3 text-lg font-semibold" style={{ color: "var(--text)" }}>Log care</h2>
        <QuickLogCare plantId={id} />

        {careEntries.length > 0 && (
          <div className="mt-4 space-y-2">
            {careEntries.slice(0, 5).map(entry => {
              const meta = CARE_META[entry.type];
              const entryDate = new Date(entry.logged_at).toLocaleDateString("en-US", { month: "short", day: "numeric" });
              return (
                <div key={entry.id} className="group flex items-center gap-3 rounded-xl px-3 py-2" style={{ background: "var(--card)", border: "1px solid #ede8e0" }}>
                  <span className="text-base" aria-hidden="true">{meta.emoji}</span>
                  <p className="flex-1 text-sm" style={{ color: "var(--text)" }}>{meta.label}</p>
                  <p className="text-xs" style={{ color: "var(--muted)" }}>{entryDate}</p>
                  <form action={deleteCareEntry.bind(null, entry.id, id)}>
                    <button
                      type="submit"
                      aria-label={`Delete ${meta.label.toLowerCase()} entry from ${entryDate}`}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-xs opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 focus-visible:opacity-100 hover:bg-red-50 hover:text-red-600"
                      style={{ color: "var(--muted)" }}
                    >
                      ✕
                    </button>
                  </form>
                </div>
              );
            })}
            {careEntries.length > 5 && (
              <Link href={`/app/care-log?plant=${id}`} className="block text-center text-xs font-medium hover:underline" style={{ color: "var(--orange-text)" }}>
                View full care history →
              </Link>
            )}
          </div>
        )}
      </section>

      {/* Add to timeline */}
      <section id="timeline" className="mb-6 space-y-3" aria-labelledby="add-checkin-heading">
        <h2 id="add-checkin-heading" className="text-lg font-semibold" style={{ color: "var(--text)" }}>Add a check-in</h2>
        <PhotoUpload plantId={id} />
        <NoteForm plantId={id} />
      </section>

      {/* Unified timeline: photos + notes by date */}
      <section aria-labelledby="timeline-heading">
        <h2 id="timeline-heading" className="mb-4 text-lg font-semibold" style={{ color: "var(--text)" }}>Timeline</h2>
        {timeline.length === 0 ? (
          <div className="rounded-2xl py-16 text-center" style={{ background: "var(--card)", border: "2px dashed #ddd5c8" }}>
            <div className="mb-2 text-3xl" aria-hidden="true">🌱</div>
            <p className="text-sm" style={{ color: "var(--muted)" }}>Nothing logged yet — add a photo or note above to start the story.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {[...grouped.entries()].map(([day, items]) => (
              <div key={day}>
                <p className="mb-2.5 text-xs font-bold uppercase tracking-widest" style={{ color: "var(--muted)" }}>{day}</p>
                <div className="space-y-3">
                  {items.map(item => {
                    if (item.kind === "photo") {
                      const photo = item.photo;
                      const photoTime = new Date(photo.taken_at).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
                      return (
                        <div key={`photo-${photo.id}`} className="group relative overflow-hidden rounded-2xl" style={{ background: "#ede8e0", border: "1px solid #ede8e0" }}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={`/api/photos/${photo.id}`}
                            alt={photo.caption ? `${plant.name}: ${photo.caption}` : `Photo of ${plant.name}`}
                            className="h-64 w-full object-cover"
                          />
                          {photo.is_shared && (
                            <div className="absolute right-3 top-3 rounded-full px-2.5 py-1 text-xs font-semibold" style={{ background: "var(--orange)", color: "var(--navy)" }}>
                              Shared
                            </div>
                          )}
                          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 bg-gradient-to-t from-black/70 p-3 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                            {photo.caption && <p className="text-sm text-white">{photo.caption}</p>}
                            <div className="ml-auto flex gap-3">
                              <form action={photo.is_shared ? unsharePhoto.bind(null, photo.id, id) : sharePhoto.bind(null, photo.id, id)}>
                                <button type="submit" className="text-xs font-medium text-orange-200 underline-offset-2 hover:underline focus-visible:opacity-100">
                                  {photo.is_shared ? "Unshare" : "Share"}
                                </button>
                              </form>
                              <form action={deletePhoto.bind(null, photo.id, photo.storage_path, id)}>
                                <button type="submit" className="text-xs font-medium text-red-200 underline-offset-2 hover:underline focus-visible:opacity-100">Delete</button>
                              </form>
                            </div>
                          </div>
                          <p className="px-3.5 py-2.5 text-sm" style={{ color: "var(--text)", background: "var(--card)" }}>
                            {photo.caption ?? <span style={{ color: "var(--muted)" }}>No caption</span>}{" "}
                            <span className="text-xs" style={{ color: "var(--muted)" }}>· {photoTime}</span>
                          </p>
                        </div>
                      );
                    }
                    const note = item.note;
                    const noteTime = new Date(note.created_at).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
                    return (
                      <div key={`note-${note.id}`} className="group flex items-start gap-3 rounded-2xl p-4" style={{ background: "var(--card)", border: "1px solid #ede8e0" }}>
                        <span className="mt-0.5 text-base" aria-hidden="true">📝</span>
                        <div className="flex-1">
                          <p className="whitespace-pre-wrap text-sm" style={{ color: "var(--text)" }}>{note.body}</p>
                          <p className="mt-1 text-xs" style={{ color: "var(--muted)" }}>{noteTime}</p>
                        </div>
                        <form action={deleteNote.bind(null, note.id, id)}>
                          <button
                            type="submit"
                            aria-label={`Delete note from ${day}`}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-xs opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 focus-visible:opacity-100 hover:bg-red-50 hover:text-red-600"
                            style={{ color: "var(--muted)" }}
                          >
                            ✕
                          </button>
                        </form>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
