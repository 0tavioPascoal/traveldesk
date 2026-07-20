import "server-only";

import type { VehicleFormInput } from "@/features/vehicles/schemas/vehicle-schema";
import type { VehicleMutationResult } from "@/features/vehicles/types/vehicle";
import { requireOrganizationRole } from "@/features/organizations/application/require-organization-role";
import { createClient } from "@/lib/supabase/server";

export async function updateVehicle(
  organizationSlug: string,
  vehicleId: string,
  input: VehicleFormInput,
): Promise<VehicleMutationResult> {
  const context = await requireOrganizationRole(
    organizationSlug,
    ["admin", "coordinator"] as const,
  );
  const supabase = await createClient();
  const [currentResult, duplicateResult] = await Promise.all([
    supabase
      .from("vehicles")
      .select("id, current_mileage")
      .eq("organization_id", context.organization.id)
      .eq("id", vehicleId)
      .maybeSingle(),
    supabase
      .from("vehicles")
      .select("id")
      .eq("organization_id", context.organization.id)
      .eq("plate", input.plate)
      .neq("id", vehicleId)
      .limit(1)
      .maybeSingle(),
  ]);

  if (currentResult.error || duplicateResult.error) {
    return { success: false, reason: "unexpected" };
  }
  if (!currentResult.data) return { success: false, reason: "not_found" };
  if (duplicateResult.data) return { success: false, reason: "duplicate_plate" };

  const currentMileage = currentResult.data.current_mileage;
  const isReduction =
    currentMileage !== null &&
    (input.currentMileage === null || input.currentMileage < currentMileage);
  if (isReduction && context.membership.role !== "admin") {
    return { success: false, reason: "mileage_reduction_forbidden" };
  }

  const { data, error } = await supabase
    .from("vehicles")
    .update({
      plate: input.plate,
      brand: input.brand,
      model: input.model,
      manufacture_year: input.manufactureYear,
      model_year: input.modelYear,
      passenger_capacity: input.passengerCapacity,
      base_city: input.baseCity,
      base_state: input.baseState,
      current_mileage: input.currentMileage,
      operational_status: input.operationalStatus,
      licensing_expires_at: input.licensingExpiresAt,
      maintenance_due_at: input.maintenanceDueAt,
      notes: input.notes,
      updated_by: context.membership.profileId,
    })
    .eq("organization_id", context.organization.id)
    .eq("id", vehicleId)
    .select("id")
    .maybeSingle();

  if (error) {
    if (error.code === "23505") return { success: false, reason: "duplicate_plate" };
    if (error.message.includes("vehicle_mileage_reduction_forbidden")) {
      return { success: false, reason: "mileage_reduction_forbidden" };
    }
    return { success: false, reason: "unexpected" };
  }
  return data
    ? { success: true, vehicleId: data.id }
    : { success: false, reason: "not_found" };
}
