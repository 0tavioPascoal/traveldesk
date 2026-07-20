import "server-only";

import { requireOrganizationRole } from "@/features/organizations/application/require-organization-role";
import { mapUnavailabilityError } from "@/features/unavailabilities/application/map-unavailability-error";
import { normalizeUnavailabilityPeriod } from "@/features/unavailabilities/application/normalize-unavailability-period";
import { checkTechnicianAvailability } from "@/features/unavailabilities/queries/check-technician-availability";
import type { UnavailabilityFormInput } from "@/features/unavailabilities/schemas/unavailability-schema";
import type { UnavailabilityMutationResult } from "@/features/unavailabilities/types/unavailability";
import { createClient } from "@/lib/supabase/server";

export async function createTechnicianUnavailability(
  organizationSlug: string,
  input: UnavailabilityFormInput,
): Promise<UnavailabilityMutationResult> {
  const context = await requireOrganizationRole(organizationSlug, ["admin", "coordinator"] as const);
  const period = normalizeUnavailabilityPeriod(input, context.organization.timezone);
  if (!period.success) return { success: false, reason: "invalid_period" };
  const supabase = await createClient();
  const [resource, type, availability] = await Promise.all([
    supabase.from("technicians").select("id").eq("organization_id", context.organization.id).eq("id", input.resourceId).eq("active", true).maybeSingle(),
    supabase.from("technician_unavailability_types").select("id").eq("organization_id", context.organization.id).eq("id", input.unavailabilityTypeId).eq("active", true).maybeSingle(),
    checkTechnicianAvailability(organizationSlug, input.resourceId, period.startsAt, period.endsAt),
  ]);
  if (resource.error || type.error) return { success: false, reason: "unexpected" };
  if (!resource.data) return { success: false, reason: "resource_not_available" };
  if (!type.data) return { success: false, reason: "type_not_available" };
  if (!availability.available) return { success: false, reason: "overlap" };
  const { data, error } = await supabase.from("technician_unavailabilities").insert({
    organization_id: context.organization.id,
    technician_id: input.resourceId,
    unavailability_type_id: input.unavailabilityTypeId,
    starts_at: period.startsAt,
    ends_at: period.endsAt,
    all_day: input.allDay,
    reason: input.reason,
    notes: input.notes,
    active: true,
    created_by: context.membership.profileId,
    updated_by: context.membership.profileId,
  }).select("id").single();
  if (error) return mapUnavailabilityError(error);
  return { success: true, id: data.id };
}
