import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

export default async function PublicProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const supabase = await createClient();
  const { username } = await params;

  const { data: profileRaw } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .eq("is_public", true)
    .single();

  type Profile = {
    id: string; username: string; display_name: string | null;
    bio: string | null; avatar_storage_path: string | null;
  };
  const profile = profileRaw as Profile | null;
  if (!profile) notFound();

  type SharedPhoto = {
    id: string; caption: string | null; shared_at: string;
    plants: { name: string; species: string | null } | null;
  };
  const { data: photosRaw } = await supabase
    .from("photos")
    .select("id, caption, shared_at, plants(name, species)")
    .eq("user_id", profile.id)
    .eq("is_shared", true)
    .order("shared_at", { ascending: false });

  const photos = (photosRaw ?? []) as unknown as SharedPhoto[];

  const avatarUrl = profile.avatar_storage_path
    ? supabase.storage.from("avatars").getPublicUrl(profile.avatar_storage_path).data.publicUrl
    : null;

  return (
    <main className="min-h-screen" style={{ background: "var(--cream)" }}>
      {/* Header */}
      <div className="border-b" style={{ background: "var(--card)", borderColor: "#ede8e0" }}>
        <div className="mx-auto max-w-3xl px-6 py-10">
          <div className="flex items-center gap-6">
            <div
              className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl text-3xl"
              style={{ background: "var(--orange-light)" }}
            >
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl} alt={profile.display_name ?? profile.username} className="h-full w-full object-cover" />
              ) : "🌿"}
            </div>
            <div>
              <h1 className="text-2xl font-bold" style={{ color: "var(--text)", fontFamily: "var(--font-display)" }}>
                {profile.display_name ?? profile.username}
              </h1>
              <p className="text-sm" style={{ color: "var(--muted)" }}>@{profile.username}</p>
              {profile.bio && <p className="mt-2 text-sm" style={{ color: "var(--text)" }}>{profile.bio}</p>}
              <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>{photos.length} shared update{photos.length !== 1 ? "s" : ""}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Photo grid */}
      <div className="mx-auto max-w-3xl px-6 py-8">
        {photos.length === 0 ? (
          <div className="rounded-3xl py-24 text-center" style={{ background: "var(--card)", border: "2px dashed #ddd5c8", color: "var(--muted)" }}>
            No shared updates yet.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {photos.map(photo => (
              <div key={photo.id} className="overflow-hidden rounded-2xl shadow-sm" style={{ background: "var(--card)", border: "1px solid #ede8e0" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/api/photos/${photo.id}`}
                  alt={photo.caption ?? photo.plants?.name ?? "Plant photo"}
                  className="h-48 w-full object-cover"
                />
                <div className="p-3.5">
                  {photo.plants && (
                    <p className="text-xs font-semibold" style={{ color: "var(--text)" }}>{photo.plants.name}</p>
                  )}
                  {photo.plants?.species && (
                    <p className="text-xs italic" style={{ color: "var(--muted)" }}>{photo.plants.species}</p>
                  )}
                  {photo.caption && (
                    <p className="mt-1 text-xs" style={{ color: "var(--text)" }}>{photo.caption}</p>
                  )}
                  <p className="mt-1 text-xs" style={{ color: "#9ca3af" }}>
                    {new Date(photo.shared_at).toLocaleDateString("en-US", {
                      month: "short", day: "numeric", year: "numeric",
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="py-8 text-center">
        <a href="/" className="text-xs hover:underline" style={{ color: "var(--muted)" }}>🌿 Leaflog</a>
      </div>
    </main>
  );
}
