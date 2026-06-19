"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function addCollection(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const name = formData.get("name") as string;
  await supabase.from("collections").insert({ user_id: user.id, name });
  revalidatePath("/app/collections");
}

export async function addPlantToCollection(collectionId: string, plantId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await supabase.from("plant_collections").upsert({ collection_id: collectionId, plant_id: plantId });
  revalidatePath(`/app/collections/${collectionId}`);
}

export async function removePlantFromCollection(collectionId: string, plantId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await supabase
    .from("plant_collections")
    .delete()
    .eq("collection_id", collectionId)
    .eq("plant_id", plantId);
  revalidatePath(`/app/collections/${collectionId}`);
}

export async function deleteCollection(collectionId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await supabase.from("collections").delete().eq("id", collectionId).eq("user_id", user.id);
  revalidatePath("/app/collections");
  redirect("/app/collections");
}
