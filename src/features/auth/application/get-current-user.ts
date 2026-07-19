import "server-only";

import type { AuthenticatedUser } from "@/features/auth/types/auth";
import { createClient } from "@/lib/supabase/server";

export async function getCurrentUser(): Promise<AuthenticatedUser | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getClaims();

    if (error || !data) {
      return null;
    }

    const { email, sub } = data.claims;

    if (typeof sub !== "string" || typeof email !== "string") {
      return null;
    }

    return { email, id: sub };
  } catch {
    return null;
  }
}
