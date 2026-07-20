import "server-only";

import { requireOrganizationRole } from "@/features/organizations/application/require-organization-role";
import type { UnavailabilityTypeFormInput } from "@/features/unavailabilities/schemas/unavailability-type-schema";
import type { UnavailabilityMutationResult } from "@/features/unavailabilities/types/unavailability";
import { createClient } from "@/lib/supabase/server";

export async function createTechnicianUnavailabilityType(
  organizationSlug: string,
  input: UnavailabilityTypeFormInput,
): Promise<UnavailabilityMutationResult> {
  const context = await requireOrganizationRole(organizationSlug, ["admin", "coordinator"] as const);
  const supabase = await createClient();
  const { data, error } = await supabase.from("technician_unavailability_types").insert({
    organization_id: context.organization.id,
    name: input.name,
    description: input.description,
    active: input.active,
    created_by: context.membership.profileId,
    updated_by: context.membership.profileId,
  }).select("id").single();
  if (error) return { success: false, reason: error.code === "23505" ? "duplicate_name" : "unexpected" };
  return { success: true, id: data.id };
}
