import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { unsharePhoto } from "@/lib/profileActions";

export default async function MyProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profileRaw } = await supabase
    .from("profiles").select("*").eq("id", user!.id).single();

  type Profile = {
    username: string | null; display_name: string | null;
    bio: string | null; is_public: boolean; avatar_storage_path: string | null;
  };
  const profile = profileRaw as Profile | null;

  const avatarUrl = profile?.avatar_storage_path
    ? supabase.storage.from("avatars").getPublicUrl(profile.avatar_storage_path).data.publicUrl
    : null;

  type SharedPhoto = {
    id: string; caption: string | null; shared_at: string;
    plants: { id: string; name: string; species: string | null } | null;
  };
  const { data: photosRaw } = await supabase
    .from("photos")
    .select("id, caption, shared_at, plants(id, name, species)")
    .eq("user_id", user!.id)
    .eq("is_shared", true)
    .order("shared_at", { ascending: false });
  const photos = (photosRaw ?? []) as unknown as SharedPhoto[];

  const { count: plantCount } = await supabase
    .from("plants").select("id", { count: "exact", head: true }).eq("user_id", user!.id);

  const displayName = profile?.display_name ?? profile?.username ?? null;
  const initials = (displayName ?? user!.email ?? "?")[0].toUpperCase();

  return (
    <div>
      {/* Hero header */}
      <div className="relative" style={{ background: "var(--navy)" }}>
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full opacity-10" style={{ background: "var(--orange)", filter: "blur(60px)" }} />
          <div className="absolute -left-8 bottom-0 h-48 w-48 rounded-full opacity-10" style={{ background: "#60a5fa", filter: "blur(50px)" }} />
        </div>

        <div className="relative px-8 pt-8 pb-0">
          <div className="flex items-end justify-between">
            <div className="flex items-end gap-5">
              {/* Avatar */}
              <div className="relative">
                <div
                  className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl text-3xl font-bold text-white shadow-xl"
                  style={{ background: avatarUrl ? "transparent" : "#374151", border: "3px solid rgba(255,255,255,0.15)" }}
                >
                  {avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span aria-hidden="true">{initials}</span>
                  )}
                </div>
                {profile?.is_public && (
                  <div className="absolute -bottom-2 -right-2 rounded-full px-1.5 py-0.5 text-xs font-bold text-white" style={{ background: "#15803d" }}>
                    <span aria-hidden="true">✓</span>
                    <span className="sr-only">Public profile</span>
                  </div>
                )}
              </div>

              {/* Name + meta */}
              <div className="pb-5">
                <h1 className="text-2xl font-bold text-white">
                  {displayName ?? "My Profile"}
                </h1>
                {profile?.username && (
                  <p className="text-sm" style={{ color: "#9ca3af" }}>@{profile.username}</p>
                )}
                {profile?.bio && (
                  <p className="mt-1 max-w-sm text-sm" style={{ color: "#d1d5db" }}>{profile.bio}</p>
                )}
              </div>
            </div>

            {/* Gear */}
            <div className="pb-6 flex items-center gap-2">
              {profile?.is_public && profile.username && (
                <a
                  href={`/u/${profile.username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors"
                  style={{ background: "rgba(255,255,255,0.1)", color: "white" }}
                >
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Public profile
                  <span className="sr-only">(opens in new tab)</span>
                </a>
              )}
              <Link
                href="/app/settings/profile"
                aria-label="Edit profile settings"
                title="Edit profile"
                className="flex h-11 w-11 items-center justify-center rounded-xl transition-colors hover:bg-white/20"
                style={{ background: "rgba(255,255,255,0.1)", color: "white" }}
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="relative mx-8 mt-2">
          <div className="flex gap-0 rounded-t-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.07)" }}>
            {[
              { label: "Plants", value: plantCount ?? 0 },
              { label: "Shared updates", value: photos.length },
              { label: "Profile", value: profile?.is_public ? "Public" : "Private" },
            ].map(({ label, value }, i) => (
              <div key={label} className="flex-1 px-6 py-4" style={{ borderLeft: i > 0 ? "1px solid rgba(255,255,255,0.08)" : "none" }}>
                <p className="text-xl font-bold text-white">{value}</p>
                <p className="text-xs" style={{ color: "#9ca3af" }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-8 py-6">
        {/* No profile prompt */}
        {!profile && (
          <div className="mb-6 flex items-center gap-4 rounded-2xl p-5 shadow-sm" style={{ background: "var(--card)", border: "1px solid #fed7aa" }}>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xl" style={{ background: "var(--orange-light)" }} aria-hidden="true">🪪</div>
            <div className="flex-1">
              <p className="font-semibold" style={{ color: "var(--text)" }}>Set up your profile</p>
              <p className="text-sm" style={{ color: "var(--muted)" }}>Choose a username and go public to share plant updates with friends.</p>
            </div>
            <Link
              href="/app/settings/profile"
              className="shrink-0 rounded-xl px-4 py-2 text-sm font-semibold"
              style={{ background: "var(--orange)", color: "var(--navy)" }}
            >
              Set up →
            </Link>
          </div>
        )}

        {/* Shared updates heading */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold" style={{ color: "var(--text)" }}>Shared updates</h2>
          {photos.length > 0 && (
            <span className="rounded-full px-3 py-1 text-xs font-semibold" style={{ background: "var(--orange-light)", color: "var(--orange-text)" }}>
              {photos.length} post{photos.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {photos.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl py-20 text-center" style={{ background: "var(--card)", border: "2px dashed var(--border)" }}>
            <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-2xl text-3xl" style={{ background: "var(--cream)" }} aria-hidden="true">📸</div>
            <p className="font-semibold" style={{ color: "var(--text)" }}>No shared updates yet</p>
            <p className="mt-1 max-w-xs text-sm" style={{ color: "var(--muted)" }}>
              When you upload a photo to a plant, tap &quot;Share to profile&quot; to post it here.
            </p>
            <Link
              href="/app"
              className="mt-5 rounded-xl px-5 py-2.5 text-sm font-semibold"
              style={{ background: "var(--orange)", color: "var(--navy)" }}
            >
              Go to my plants
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {photos.map(photo => (
              <div key={photo.id} className="group overflow-hidden rounded-2xl shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5" style={{ background: "var(--card)" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/api/photos/${photo.id}`}
                  alt={photo.caption ? `${photo.plants?.name ?? "Plant"}: ${photo.caption}` : `Shared photo of ${photo.plants?.name ?? "a plant"}`}
                  className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="p-3.5">
                  {photo.plants && (
                    <Link href={`/app/plants/${photo.plants.id}`} className="text-sm font-semibold hover:underline" style={{ color: "var(--text)" }}>
                      {photo.plants.name}
                    </Link>
                  )}
                  {photo.plants?.species && <p className="text-xs italic" style={{ color: "var(--muted)" }}>{photo.plants.species}</p>}
                  {photo.caption && <p className="mt-1 text-xs" style={{ color: "var(--muted)" }}>{photo.caption}</p>}
                  <div className="mt-2 flex items-center justify-between">
                    <p className="text-xs" style={{ color: "var(--muted)" }}>
                      <time dateTime={photo.shared_at}>
                        {new Date(photo.shared_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </time>
                    </p>
                    <form action={unsharePhoto.bind(null, photo.id, photo.plants?.id ?? "")}>
                      <button
                        type="submit"
                        aria-label={`Unshare photo of ${photo.plants?.name ?? "plant"}`}
                        className="rounded-md px-2 py-1 text-xs font-medium transition-colors hover:bg-red-50 hover:text-red-600"
                        style={{ color: "var(--muted)" }}
                      >
                        Unshare
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
