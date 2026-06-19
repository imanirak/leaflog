import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { sharePhoto, unsharePhoto } from "@/lib/profileActions";

export default async function MyProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profileRaw } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user!.id)
    .single();

  type Profile = {
    username: string | null; display_name: string | null;
    bio: string | null; is_public: boolean; avatar_storage_path: string | null;
  };
  const profile = profileRaw as Profile | null;

  const avatarUrl = profile?.avatar_storage_path
    ? supabase.storage.from("avatars").getPublicUrl(profile.avatar_storage_path).data.publicUrl
    : null;

  type SharedPhoto = {
    id: string; caption: string | null; shared_at: string; is_shared: boolean;
    plants: { id: string; name: string; species: string | null } | null;
  };
  const { data: photosRaw } = await supabase
    .from("photos")
    .select("id, caption, shared_at, is_shared, plants(id, name, species)")
    .eq("user_id", user!.id)
    .eq("is_shared", true)
    .order("shared_at", { ascending: false });
  const photos = (photosRaw ?? []) as unknown as SharedPhoto[];

  const { count: plantCount } = await supabase
    .from("plants")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user!.id);

  return (
    <div className="flex-1 p-8">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div className="flex items-center gap-5">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full text-3xl font-semibold text-white" style={{ background: "#3a3f58" }}>
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt="avatar" className="h-full w-full object-cover" />
            ) : (
              (profile?.display_name ?? profile?.username ?? user!.email ?? "?")[0].toUpperCase()
            )}
          </div>
          <div>
            <h1 className="text-2xl font-semibold" style={{ color: "#1c1f2e" }}>
              {profile?.display_name ?? profile?.username ?? "My profile"}
            </h1>
            {profile?.username && <p className="text-sm text-stone-400">@{profile.username}</p>}
            {profile?.bio && <p className="mt-1 text-sm text-stone-600">{profile.bio}</p>}
            <div className="mt-2 flex items-center gap-4 text-sm text-stone-400">
              <span>{plantCount ?? 0} plant{plantCount !== 1 ? "s" : ""}</span>
              <span>{photos.length} shared update{photos.length !== 1 ? "s" : ""}</span>
              <span
                className="rounded-full px-2.5 py-0.5 text-xs font-medium"
                style={{
                  background: profile?.is_public ? "#dcfce7" : "#f3f4f6",
                  color: profile?.is_public ? "#15803d" : "#6b7280",
                }}
              >
                {profile?.is_public ? "Public" : "Private"}
              </span>
            </div>
          </div>
        </div>

        {/* Gear → settings */}
        <Link
          href="/app/settings/profile"
          title="Edit profile"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-stone-200 bg-white text-stone-500 transition-colors hover:bg-stone-50 hover:text-stone-800"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </Link>
      </div>

      {/* No profile set up yet */}
      {!profile && (
        <div className="mb-8 rounded-2xl border border-orange-100 bg-orange-50 px-6 py-5">
          <p className="font-medium text-orange-800">Set up your profile</p>
          <p className="mt-1 text-sm text-orange-600">Choose a username and make your profile public to share plant updates with friends.</p>
          <Link
            href="/app/settings/profile"
            className="mt-3 inline-block rounded-xl px-4 py-2 text-sm font-medium text-white"
            style={{ background: "var(--orange)" }}
          >
            Set up profile →
          </Link>
        </div>
      )}

      {/* Public profile link */}
      {profile?.is_public && profile.username && (
        <div className="mb-6">
          <a
            href={`/u/${profile.username}`}
            target="_blank"
            className="text-sm font-medium hover:underline"
            style={{ color: "var(--orange)" }}
          >
            View public profile ↗
          </a>
        </div>
      )}

      {/* Shared photos grid */}
      <h2 className="mb-4 text-lg font-semibold" style={{ color: "#1c1f2e" }}>Shared updates</h2>
      {photos.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-stone-200 py-16 text-center">
          <div className="mb-3 text-4xl">📸</div>
          <p className="text-stone-500">No shared updates yet</p>
          <p className="mt-1 text-sm text-stone-400">When you upload a photo, tap "Share to profile" to post it here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {photos.map(photo => (
            <div key={photo.id} className="group overflow-hidden rounded-2xl bg-white shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/api/photos/${photo.id}`}
                alt={photo.caption ?? photo.plants?.name ?? "Plant photo"}
                className="h-48 w-full object-cover"
              />
              <div className="p-3">
                {photo.plants && (
                  <Link href={`/app/plants/${photo.plants.id}`} className="text-xs font-medium text-stone-700 hover:text-orange-500">
                    {photo.plants.name}
                  </Link>
                )}
                {photo.caption && <p className="mt-0.5 text-xs text-stone-500">{photo.caption}</p>}
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-xs text-stone-400">
                    {new Date(photo.shared_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                  <form action={unsharePhoto.bind(null, photo.id, photo.plants?.id ?? "")}>
                    <button type="submit" className="text-xs text-stone-300 hover:text-red-400 transition-colors">
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
  );
}
