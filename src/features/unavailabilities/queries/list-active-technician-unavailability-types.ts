import "server-only";

import { requireOrganizationRole } from "@/features/organizations/application/require-organization-role";
import type { UnavailabilityTypeOption } from "@/features/unavailabilities/types/unavailability";
import { createClient } from "@/lib/supabase/server";

export async function listActiveTechnicianUnavailabilityTypes(
  organizationSlug: string,
): Promise<UnavailabilityTypeOption[]> {
  const context = await requireOrganizationRole(organizationSlug, ["admin", "coordinator"] as const);
  const supabase = await createClient();
  const { data, error } = await supabase.from("technician_unavailability_types")
    .select("id, name, active")
    .eq("organization_id", context.organization.id)
    .eq("active", true)
    .order("name");
  if (error) throw new Error("Não foi possível carregar os tipos ativos.");
  return data;
}
