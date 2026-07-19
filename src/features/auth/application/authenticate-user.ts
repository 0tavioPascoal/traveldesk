import "server-only";

import type { LoginCredentials } from "@/features/auth/schemas/login-schema";
import type { AuthenticateUserResult } from "@/features/auth/types/auth";
import { createClient } from "@/lib/supabase/server";

export async function authenticateUser(
  credentials: LoginCredentials,
): Promise<AuthenticateUserResult> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword(credentials);

    if (!error) {
      return { success: true };
    }

    if (error.code === "invalid_credentials") {
      return { success: false, reason: "invalid_credentials" };
    }

    return { success: false, reason: "authentication_unavailable" };
  } catch {
    return { success: false, reason: "authentication_unavailable" };
  }
}
