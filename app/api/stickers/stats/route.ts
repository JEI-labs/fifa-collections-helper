import { createSupabaseServer } from "@/lib/supabase";

export async function GET() {
  const supabase = createSupabaseServer();

  const { data, error } = await supabase
    .from("stickers")
    .select("is_duplicate");

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  const total = data?.length || 0;
  const duplicates = data?.filter((s) => s.is_duplicate).length || 0;
  const unique = total - duplicates;

  return Response.json({ total, unique, duplicates });
}
