import "server-only";

import type { VehicleMutationResult } from "@/features/vehicles/types/vehicle";
import { requireOrganizationRole } from "@/features/organizations/application/require-organization-role";
import { createClient } from "@/lib/supabase/server";

export async function changeVehicleActiveState(
  organizationSlug: string,
  vehicleId: string,
  active: boolean,
): Promise<VehicleMutationResult> {
  const context = await requireOrganizationRole(
    organizationSlug,
    ["admin", "coordinator"] as const,
  );
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("vehicles")
    .update({ active, updated_by: context.membership.profileId })
    .eq("organization_id", context.organization.id)
    .eq("id", vehicleId)
    .select("id")
    .maybeSingle();
  if (error) return { success: false, reason: "unexpected" };
  return data
    ? { success: true, vehicleId: data.id }
    : { success: false, reason: "not_found" };
}
