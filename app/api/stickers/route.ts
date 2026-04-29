import { createSupabaseServer } from "@/lib/supabase";

export async function GET() {
  const supabase = createSupabaseServer();

  const { data, error } = await supabase
    .from("stickers")
    .select("*")
    .order("scanned_at", { ascending: false });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json(data);
}

export async function POST(req: Request) {
  const body = await req.json();

  const { code, number, fullCode, isDuplicate } = body;

  if (!code || !number || !fullCode) {
    return Response.json({ error: "Missing fields" }, { status: 400 });
  }

  const supabase = createSupabaseServer();

  const { error } = await supabase.from("stickers").insert({
    code,
    number,
    full_code: fullCode,
    is_duplicate: isDuplicate,
  });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ success: true });
}
