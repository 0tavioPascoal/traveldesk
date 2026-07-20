import "server-only";

import type { EligibleProfile } from "@/features/technicians/types/technician";
import { requireOrganizationRole } from "@/features/organizations/application/require-organization-role";
import { createClient } from "@/lib/supabase/server";

export async function getAvailableProfilesForTechnicianLink(
  organizationSlug: string,
  technicianId?: string,
): Promise<EligibleProfile[]> {
  const context = await requireOrganizationRole(organizationSlug, ["admin"] as const);
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("list_available_technician_profiles", {
    p_organization_id: context.organization.id,
    p_technician_id: technicianId ?? undefined,
  });
  if (error) throw new Error("Não foi possível carregar os usuários elegíveis.");
  return data;
}
