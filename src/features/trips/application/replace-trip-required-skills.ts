import "server-only";

import { requireOrganizationRole } from "@/features/organizations/application/require-organization-role";
import { mapTripStaffingError } from "@/features/trips/application/map-trip-staffing-error";
import type { TripRequiredSkillsInput } from "@/features/trips/schemas/trip-required-skills-schema";
import type { TripStaffingMutationResult } from "@/features/trips/types/trip-staffing";
import type { Json } from "@/lib/supabase/database.types";
import { createClient } from "@/lib/supabase/server";

export async function replaceTripRequiredSkills(
  organizationSlug: string,
  input: TripRequiredSkillsInput,
): Promise<TripStaffingMutationResult> {
  const context = await requireOrganizationRole(organizationSlug, ["admin", "coordinator"] as const);
  const payload: Json = input.requirements.map((item) => ({
    skill_id: item.skillId,
    minimum_proficiency_level: item.minimumProficiencyLevel,
    notes: item.notes || null,
  }));
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("replace_trip_required_skills", {
    p_organization_id: context.organization.id,
    p_trip_id: input.tripId,
    p_requirements: payload,
  });
  if (error) return mapTripStaffingError(error);
  return data ? { success: true } : { success: false, reason: "unexpected" };
}
