import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Lazy initialization to avoid build errors
let supabaseClient: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient {
  if (!supabaseClient) {
    if (!supabaseUrl || !supabaseAnonKey) {
      // Return a mock client for build time
      console.warn("Supabase credentials not configured. Using mock client.");
      supabaseClient = createClient(
        "https://placeholder.supabase.co",
        "placeholder",
      );
    } else {
      supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
    }
  }
  return supabaseClient;
}

export const supabase = {
  get client() {
    return getSupabaseClient();
  },
  from(table: string) {
    return getSupabaseClient().from(table);
  },
};

export async function checkDuplicate(fullCode: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("stickers")
    .select("id")
    .eq("full_code", fullCode)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("Error checking duplicate:", error);
    return false;
  }

  return !!data;
}

export async function saveSticker(
  code: string,
  number: number,
  fullCode: string,
  isDuplicate: boolean,
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase.from("stickers").insert({
    code,
    number,
    full_code: fullCode,
    is_duplicate: isDuplicate,
  });

  if (error) {
    console.error("Error saving sticker:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function getAllStickers() {
  const { data, error } = await supabase
    .from("stickers")
    .select("*")
    .order("scanned_at", { ascending: false });

  if (error) {
    console.error("Error fetching stickers:", error);
    return [];
  }

  return data || [];
}

export async function deleteSticker(id: string): Promise<boolean> {
  const { error } = await supabase.from("stickers").delete().eq("id", id);

  if (error) {
    console.error("Error deleting sticker:", error);
    return false;
  }

  return true;
}

export async function getStickerStats() {
  const { data, error } = await supabase
    .from("stickers")
    .select("is_duplicate");

  if (error) {
    console.error("Error fetching stats:", error);
    return { total: 0, unique: 0, duplicates: 0 };
  }

  const total = data?.length || 0;
  const duplicates = data?.filter((s) => s.is_duplicate).length || 0;
  const unique = total - duplicates;

  return { total, unique, duplicates };
}
