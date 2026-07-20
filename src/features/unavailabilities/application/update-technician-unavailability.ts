import "server-only";

import { requireOrganizationRole } from "@/features/organizations/application/require-organization-role";
import { mapUnavailabilityError } from "@/features/unavailabilities/application/map-unavailability-error";
import { normalizeUnavailabilityPeriod } from "@/features/unavailabilities/application/normalize-unavailability-period";
import { checkTechnicianAvailability } from "@/features/unavailabilities/queries/check-technician-availability";
import type { UnavailabilityFormInput } from "@/features/unavailabilities/schemas/unavailability-schema";
import type { UnavailabilityMutationResult } from "@/features/unavailabilities/types/unavailability";
import { createClient } from "@/lib/supabase/server";

export async function updateTechnicianUnavailability(
  organizationSlug: string,
  id: string,
  input: UnavailabilityFormInput,
): Promise<UnavailabilityMutationResult> {
  const context = await requireOrganizationRole(organizationSlug, ["admin", "coordinator"] as const);
  const period = normalizeUnavailabilityPeriod(input, context.organization.timezone);
  if (!period.success) return { success: false, reason: "invalid_period" };
  const supabase = await createClient();
  const currentResult = await supabase.from("technician_unavailabilities")
    .select("id, technician_id, unavailability_type_id, starts_at, ends_at, all_day, active")
    .eq("organization_id", context.organization.id).eq("id", id).maybeSingle();
  if (currentResult.error) return { success: false, reason: "unexpected" };
  const current = currentResult.data;
  if (!current) return { success: false, reason: "not_found" };
  if (new Date(current.ends_at).getTime() <= Date.now() && context.membership.role !== "admin") {
    return { success: false, reason: "past_edit_forbidden" };
  }
  const resourceChanged = current.technician_id !== input.resourceId;
  const typeChanged = current.unavailability_type_id !== input.unavailabilityTypeId;
  const periodChanged = new Date(current.starts_at).getTime() !== new Date(period.startsAt).getTime()
    || new Date(current.ends_at).getTime() !== new Date(period.endsAt).getTime()
    || current.all_day !== input.allDay;
  if (resourceChanged || (current.active && periodChanged)) {
    const { data, error } = await supabase.from("technicians").select("id")
      .eq("organization_id", context.organization.id).eq("id", input.resourceId).eq("active", true).maybeSingle();
    if (error) return { success: false, reason: "unexpected" };
    if (!data) return { success: false, reason: "resource_not_available" };
  }
  if (typeChanged || (current.active && periodChanged)) {
    const { data, error } = await supabase.from("technician_unavailability_types").select("id")
      .eq("organization_id", context.organization.id).eq("id", input.unavailabilityTypeId).eq("active", true).maybeSingle();
    if (error) return { success: false, reason: "unexpected" };
    if (!data) return { success: false, reason: "type_not_available" };
  }
  if (current.active) {
    const availability = await checkTechnicianAvailability(
      organizationSlug, input.resourceId, period.startsAt, period.endsAt, id,
    );
    if (!availability.available) return { success: false, reason: "overlap" };
  }
  const { data, error } = await supabase.from("technician_unavailabilities").update({
    technician_id: input.resourceId,
    unavailability_type_id: input.unavailabilityTypeId,
    starts_at: period.startsAt,
    ends_at: period.endsAt,
    all_day: input.allDay,
    reason: input.reason,
    notes: input.notes,
    updated_by: context.membership.profileId,
  }).eq("organization_id", context.organization.id).eq("id", id).select("id").maybeSingle();
  if (error) return mapUnavailabilityError(error);
  return data ? { success: true, id: data.id } : { success: false, reason: "not_found" };
}
