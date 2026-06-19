import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { id } = await params;

  const { data } = await supabase
    .from("photos")
    .select("storage_path")
    .eq("id", id)
    .single();

  const photo = data as { storage_path: string } | null;
  if (!photo) return new NextResponse("Not found", { status: 404 });

  const { data: signed } = await supabase.storage
    .from("plant-photos")
    .createSignedUrl(photo.storage_path, 3600);

  if (!signed?.signedUrl) return new NextResponse("Not found", { status: 404 });

  return NextResponse.redirect(signed.signedUrl);
}
