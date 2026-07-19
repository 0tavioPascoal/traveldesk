import "server-only";

import { createClient } from "@/lib/supabase/server";

export async function signOutUser(): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error("Não foi possível encerrar a sessão.");
  }
}
