import "server-only";

import type { CurrentOrganizationMemberDetails } from "@/features/organizations/types/organization";
import { createClient } from "@/lib/supabase/server";

export async function getCurrentOrganizationMemberDetails(
  organizationId: string,
  profileId: string,
): Promise<CurrentOrganizationMemberDetails | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("organization_members")
    .select("role, status, created_at, updated_at, profile:profiles!inner(name, email)")
    .eq("organization_id", organizationId)
    .eq("profile_id", profileId)
    .maybeSingle();

  if (error || !data) return null;
  return data;
}
