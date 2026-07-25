import "server-only";

import type { OrganizationAdministrationDetails } from "@/features/organizations/types/organization";
import { createClient } from "@/lib/supabase/server";

export async function getOrganizationAdministrationDetails(
  organizationId: string,
): Promise<OrganizationAdministrationDetails | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("organizations")
    .select("name, legal_name, tax_id, slug, timezone, active, created_at, updated_at")
    .eq("id", organizationId)
    .maybeSingle();

  if (error || !data) return null;
  return data;
}
