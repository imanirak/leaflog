"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const USERNAME_COOLDOWN_DAYS = 30;

export async function upsertProfile(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const newUsername = (formData.get("username") as string).trim().toLowerCase().replace(/[^a-z0-9_]/g, "");
  const display_name = formData.get("display_name") as string | null;
  const bio = formData.get("bio") as string | null;
  const is_public = formData.get("is_public") === "true";

  // Check username cooldown
  const { data: existing } = await supabase
    .from("profiles")
    .select("username, username_changed_at")
    .eq("id", user.id)
    .single();

  const existingProfile = existing as { username: string | null; username_changed_at: string | null } | null;
  const usernameChanged = existingProfile?.username && existingProfile.username !== newUsername;

  if (usernameChanged && existingProfile?.username_changed_at) {
    const daysSinceChange = (Date.now() - new Date(existingProfile.username_changed_at).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceChange < USERNAME_COOLDOWN_DAYS) {
      const daysLeft = Math.ceil(USERNAME_COOLDOWN_DAYS - daysSinceChange);
      throw new Error(`You can change your username again in ${daysLeft} day${daysLeft !== 1 ? "s" : ""}.`);
    }
  }

  const updateData: Record<string, unknown> = {
    id: user.id,
    username: newUsername,
    display_name: display_name || null,
    bio: bio || null,
    is_public,
  };

  if (usernameChanged) {
    updateData.username_changed_at = new Date().toISOString();
  }

  const { error } = await supabase.from("profiles").upsert(updateData, { onConflict: "id" });

  if (error) {
    if (error.code === "23505") throw new Error("That username is already taken.");
    throw new Error(error.message);
  }

  revalidatePath("/app/settings/profile");
  revalidatePath("/app/profile");
  revalidatePath(`/u/${newUsername}`);
}

export async function uploadAvatar(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const file = formData.get("avatar") as File;
  if (!file || file.size === 0) return;

  const ext = file.name.split(".").pop();
  const path = `${user.id}/avatar.${ext}`;

  await supabase.storage.from("avatars").upload(path, file, {
    upsert: true,
    contentType: file.type,
  });

  await supabase.from("profiles").update({ avatar_storage_path: path }).eq("id", user.id);
  revalidatePath("/app/settings/profile");
  revalidatePath("/app/profile");
}

export async function sharePhoto(photoId: string, plantId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await supabase
    .from("photos")
    .update({ is_shared: true, shared_at: new Date().toISOString() })
    .eq("id", photoId)
    .eq("user_id", user.id);

  revalidatePath(`/app/plants/${plantId}`);
  revalidatePath("/app/profile");
}

export async function unsharePhoto(photoId: string, plantId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await supabase
    .from("photos")
    .update({ is_shared: false, shared_at: null })
    .eq("id", photoId)
    .eq("user_id", user.id);

  revalidatePath(`/app/plants/${plantId}`);
  revalidatePath("/app/profile");
}
