import "server-only";

import { requireOrganizationRole } from "@/features/organizations/application/require-organization-role";
import { mapUnavailabilityError } from "@/features/unavailabilities/application/map-unavailability-error";
import { checkVehicleAvailability } from "@/features/unavailabilities/queries/check-vehicle-availability";
import type { UnavailabilityMutationResult } from "@/features/unavailabilities/types/unavailability";
import { createClient } from "@/lib/supabase/server";

export async function changeVehicleUnavailabilityStatus(
  organizationSlug: string,
  id: string,
  active: boolean,
): Promise<UnavailabilityMutationResult> {
  const context = await requireOrganizationRole(organizationSlug, ["admin", "coordinator"] as const);
  const supabase = await createClient();
  const currentResult = await supabase.from("vehicle_unavailabilities")
    .select("id, vehicle_id, unavailability_type_id, starts_at, ends_at")
    .eq("organization_id", context.organization.id).eq("id", id).maybeSingle();
  if (currentResult.error) return { success: false, reason: "unexpected" };
  const current = currentResult.data;
  if (!current) return { success: false, reason: "not_found" };
  if (active) {
    const [resource, type, availability] = await Promise.all([
      supabase.from("vehicles").select("id").eq("organization_id", context.organization.id).eq("id", current.vehicle_id).eq("active", true).maybeSingle(),
      supabase.from("vehicle_unavailability_types").select("id").eq("organization_id", context.organization.id).eq("id", current.unavailability_type_id).eq("active", true).maybeSingle(),
      checkVehicleAvailability(organizationSlug, current.vehicle_id, current.starts_at, current.ends_at, id),
    ]);
    if (resource.error || type.error) return { success: false, reason: "unexpected" };
    if (!resource.data) return { success: false, reason: "resource_not_available" };
    if (!type.data) return { success: false, reason: "type_not_available" };
    if (!availability.available) return { success: false, reason: "overlap" };
  }
  const { data, error } = await supabase.from("vehicle_unavailabilities")
    .update({ active, updated_by: context.membership.profileId })
    .eq("organization_id", context.organization.id).eq("id", id).select("id").maybeSingle();
  if (error) return mapUnavailabilityError(error);
  return data ? { success: true, id: data.id } : { success: false, reason: "not_found" };
}
