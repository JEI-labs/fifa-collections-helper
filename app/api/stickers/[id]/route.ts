import { createSupabaseServer } from "@/lib/supabase";

export async function DELETE(
  req: Request,
  context: { params: { id: string } },
) {
  const { id } = await context.params;

  console.log("Deleting sticker with id:", id);

  const supabase = createSupabaseServer();

  const { error } = await supabase.from("stickers").delete().eq("id", id);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ success: true });
}
