import "server-only";

import { getCurrentUser } from "@/features/auth/application/get-current-user";
import type { CurrentProfile } from "@/features/organizations/types/organization";
import { createClient } from "@/lib/supabase/server";

export async function getCurrentProfile(): Promise<CurrentProfile | null> {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, name, email, phone, active")
    .eq("id", user.id)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data;
}
