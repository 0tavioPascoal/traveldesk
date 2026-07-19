import { createBrowserClient } from "@supabase/ssr";

import type { Database } from "@/lib/supabase/database.types";

function getSupabaseBrowserConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !publishableKey) {
    throw new Error("Configuração pública do Supabase ausente.");
  }

  return { publishableKey, url };
}

export function createClient() {
  const { publishableKey, url } = getSupabaseBrowserConfig();

  return createBrowserClient<Database>(url, publishableKey);
}
