import "server-only";

import { requireOrganizationRole } from "@/features/organizations/application/require-organization-role";
import type { UnavailabilityTypeFormInput } from "@/features/unavailabilities/schemas/unavailability-type-schema";
import type { UnavailabilityMutationResult } from "@/features/unavailabilities/types/unavailability";
import { createClient } from "@/lib/supabase/server";

export async function updateVehicleUnavailabilityType(
  organizationSlug: string,
  id: string,
  input: UnavailabilityTypeFormInput,
): Promise<UnavailabilityMutationResult> {
  const context = await requireOrganizationRole(organizationSlug, ["admin", "coordinator"] as const);
  const supabase = await createClient();
  const { data, error } = await supabase.from("vehicle_unavailability_types").update({
    name: input.name,
    description: input.description,
    active: input.active,
    updated_by: context.membership.profileId,
  }).eq("organization_id", context.organization.id).eq("id", id).select("id").maybeSingle();
  if (error) return { success: false, reason: error.code === "23505" ? "duplicate_name" : "unexpected" };
  return data ? { success: true, id: data.id } : { success: false, reason: "not_found" };
}
