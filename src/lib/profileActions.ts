"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function upsertProfile(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const username = (formData.get("username") as string).trim().toLowerCase().replace(/[^a-z0-9_]/g, "");
  const display_name = formData.get("display_name") as string | null;
  const bio = formData.get("bio") as string | null;
  const is_public = formData.get("is_public") === "true";

  const { error } = await supabase.from("profiles").upsert({
    id: user.id,
    username,
    display_name: display_name || null,
    bio: bio || null,
    is_public,
  }, { onConflict: "id" });

  if (error) {
    // username taken
    if (error.code === "23505") throw new Error("Username already taken");
    throw new Error(error.message);
  }

  revalidatePath("/app/settings/profile");
  revalidatePath(`/u/${username}`);
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
}
