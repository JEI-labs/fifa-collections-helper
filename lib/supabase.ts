// lib/supabase-server.ts
import { createClient } from "@supabase/supabase-js";

export function createSupabaseServer() {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_PUBLISHABLE_KEY) {
    throw new Error("Missing Supabase server envs");
  }

  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_PUBLISHABLE_KEY,
  );
}
