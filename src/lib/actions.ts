"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function addPlant(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const name = formData.get("name") as string;
  const species = formData.get("species") as string | null;
  const room = formData.get("room") as string | null;
  const date_acquired = formData.get("date_acquired") as string | null;
  const tagsRaw = formData.get("tags") as string | null;

  const { data: plant, error } = await supabase
    .from("plants")
    .insert({ user_id: user.id, name, species: species || null, room: room || null, date_acquired: date_acquired || null })
    .select()
    .single();

  if (error || !plant) throw new Error(error?.message ?? "Failed to create plant");

  if (tagsRaw) {
    const tags = tagsRaw.split(",").map(t => t.trim().toLowerCase()).filter(Boolean);
    if (tags.length) {
      await supabase.from("plant_tags").insert(tags.map(tag => ({ plant_id: plant.id, user_id: user.id, tag })));
    }
  }

  revalidatePath("/app");
  redirect(`/app/plants/${plant.id}`);
}

export async function updatePlant(plantId: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const name = formData.get("name") as string;
  const species = formData.get("species") as string | null;
  const room = formData.get("room") as string | null;
  const date_acquired = formData.get("date_acquired") as string | null;
  const tagsRaw = formData.get("tags") as string | null;

  await supabase
    .from("plants")
    .update({ name, species: species || null, room: room || null, date_acquired: date_acquired || null })
    .eq("id", plantId)
    .eq("user_id", user.id);

  // Replace tags
  await supabase.from("plant_tags").delete().eq("plant_id", plantId).eq("user_id", user.id);
  if (tagsRaw) {
    const tags = tagsRaw.split(",").map(t => t.trim().toLowerCase()).filter(Boolean);
    if (tags.length) {
      await supabase.from("plant_tags").insert(tags.map(tag => ({ plant_id: plantId, user_id: user.id, tag })));
    }
  }

  revalidatePath(`/app/plants/${plantId}`);
  revalidatePath("/app");
  redirect(`/app/plants/${plantId}`);
}

export async function deletePlant(plantId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Delete all photos from storage first
  const { data: photos } = await supabase
    .from("photos")
    .select("storage_path")
    .eq("plant_id", plantId)
    .eq("user_id", user.id);

  if (photos?.length) {
    await supabase.storage.from("plant-photos").remove(photos.map(p => p.storage_path));
  }

  await supabase.from("plants").delete().eq("id", plantId).eq("user_id", user.id);

  revalidatePath("/app");
  redirect("/app");
}

export async function addNote(plantId: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const body = formData.get("body") as string;
  if (!body.trim()) return;

  await supabase.from("notes").insert({ plant_id: plantId, user_id: user.id, body });
  revalidatePath(`/app/plants/${plantId}`);
}

export async function deleteNote(noteId: string, plantId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await supabase.from("notes").delete().eq("id", noteId).eq("user_id", user.id);
  revalidatePath(`/app/plants/${plantId}`);
}

export async function uploadPhoto(plantId: string, formData: FormData): Promise<string | undefined> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const file = formData.get("file") as File;
  const caption = formData.get("caption") as string | null;
  if (!file || file.size === 0) return;

  const ext = file.name.split(".").pop();
  const path = `${user.id}/${plantId}/${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("plant-photos")
    .upload(path, file, { contentType: file.type });

  if (uploadError) throw new Error(uploadError.message);

  const { data: photo } = await supabase.from("photos").insert({
    plant_id: plantId,
    user_id: user.id,
    storage_path: path,
    caption: caption || null,
  }).select("id").single();

  revalidatePath(`/app/plants/${plantId}`);
  return (photo as { id: string } | null)?.id;
}

export async function deletePhoto(photoId: string, storagePath: string, plantId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await supabase.storage.from("plant-photos").remove([storagePath]);
  await supabase.from("photos").delete().eq("id", photoId).eq("user_id", user.id);
  revalidatePath(`/app/plants/${plantId}`);
}
