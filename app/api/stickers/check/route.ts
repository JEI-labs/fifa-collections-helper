import { createSupabaseServer } from "@/lib/supabase";

export async function POST(req: Request) {
  const { fullCode } = await req.json();

  if (!fullCode) {
    return Response.json({ error: "Missing fullCode" }, { status: 400 });
  }

  const supabase = createSupabaseServer();

  const { data, error } = await supabase
    .from("stickers")
    .select("id")
    .eq("full_code", fullCode)
    .single();

  if (error && error.code !== "PGRST116") {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ isDuplicate: !!data });
}
