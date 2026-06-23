import { createClient } from "@/lib/supabase/server";
import ProfileForm from "@/components/ProfileForm";
import Link from "next/link";

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
    username_changed_at: string | null;
  };
  const profile = profileRaw as Profile | null;

  const avatarUrl = profile?.avatar_storage_path
    ? supabase.storage.from("avatars").getPublicUrl(profile.avatar_storage_path).data.publicUrl
    : null;

  const daysUntilUsernameChange = profile?.username_changed_at
    ? Math.max(0, 30 - Math.floor((Date.now() - new Date(profile.username_changed_at).getTime()) / (1000 * 60 * 60 * 24)))
    : 0;

  return (
    <div className="mx-auto max-w-lg p-8">
      <Link href="/app/profile" className="mb-6 inline-flex items-center gap-1 text-sm hover:text-stone-600" style={{ color: "var(--muted)" }}>
        <span aria-hidden="true">←</span> Back to profile
      </Link>
      <h1 className="mb-1 text-2xl font-semibold" style={{ color: "var(--text)" }}>Profile settings</h1>
      <p className="mb-8 text-sm" style={{ color: "var(--muted)" }}>Control your public presence on Leaflog.</p>
      <ProfileForm profile={profile} avatarUrl={avatarUrl} daysUntilUsernameChange={daysUntilUsernameChange} />
    </div>
  );
}
