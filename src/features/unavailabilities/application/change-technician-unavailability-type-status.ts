import "server-only";

import { requireOrganizationRole } from "@/features/organizations/application/require-organization-role";
import type { UnavailabilityMutationResult } from "@/features/unavailabilities/types/unavailability";
import { createClient } from "@/lib/supabase/server";

export async function changeTechnicianUnavailabilityTypeStatus(
  organizationSlug: string,
  id: string,
  active: boolean,
): Promise<UnavailabilityMutationResult> {
  const context = await requireOrganizationRole(organizationSlug, ["admin", "coordinator"] as const);
  const supabase = await createClient();
  const { data, error } = await supabase.from("technician_unavailability_types")
    .update({ active, updated_by: context.membership.profileId })
    .eq("organization_id", context.organization.id).eq("id", id).select("id").maybeSingle();
  if (error) return { success: false, reason: "unexpected" };
  return data ? { success: true, id: data.id } : { success: false, reason: "not_found" };
}
