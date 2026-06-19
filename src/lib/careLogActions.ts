"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type CareType = "watered" | "fertilized" | "repotted" | "pruned" | "misted" | "rotated" | "other";

export async function logCare(plantId: string, type: CareType, note?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await supabase.from("care_log_entries").insert({
    plant_id: plantId,
    user_id: user.id,
    type,
    note: note || null,
  });

  revalidatePath(`/app/plants/${plantId}`);
  revalidatePath("/app/care-log");
  revalidatePath("/app");
}

export async function deleteCareEntry(entryId: string, plantId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await supabase.from("care_log_entries").delete().eq("id", entryId).eq("user_id", user.id);

  revalidatePath(`/app/plants/${plantId}`);
  revalidatePath("/app/care-log");
}
