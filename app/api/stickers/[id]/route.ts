import { createSupabaseServer } from "@/lib/supabase";
import { handleApiRequest, NextContextRequest } from "@/lib/utils";
import { NextRequest } from "next/server";

export const DELETE = handleApiRequest<{ success: boolean; error?: string }>(
  async (req: NextRequest, context?: NextContextRequest) => {
    const params = await context?.params;
    const id = params?.id;

    console.log("Deleting sticker with id:", id);

    const supabase = createSupabaseServer();

    const { error } = await supabase.from("stickers").delete().eq("id", id);

    if (error) {
      return {
        status: 500,
        body: { success: false, error: error.message },
      };
    }

    return {
      status: 200,
      body: { success: true },
    };
  },
);
