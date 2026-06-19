import { createClient } from "@/lib/supabase/server";
import ProfileForm from "@/components/ProfileForm";

export default async function ProfileSettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profileRaw } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user!.id)
    .single();

  type Profile = {
    username: string; display_name: string | null;
    bio: string | null; is_public: boolean; avatar_storage_path: string | null;
  };
  const profile = profileRaw as Profile | null;

  const avatarUrl = profile?.avatar_storage_path
    ? supabase.storage.from("avatars").getPublicUrl(profile.avatar_storage_path).data.publicUrl
    : null;

  return (
    <div className="mx-auto max-w-lg p-8">
      <h1 className="mb-2 text-2xl font-semibold text-stone-900">Profile settings</h1>
      <p className="mb-8 text-sm text-stone-400">
        Control your public presence on Leaflog.
      </p>
      <ProfileForm profile={profile} avatarUrl={avatarUrl} />
    </div>
  );
}
