import "server-only";

import type { VehicleFormInput } from "@/features/vehicles/schemas/vehicle-schema";
import type { VehicleMutationResult } from "@/features/vehicles/types/vehicle";
import { requireOrganizationRole } from "@/features/organizations/application/require-organization-role";
import { createClient } from "@/lib/supabase/server";

export async function createVehicle(
  organizationSlug: string,
  input: VehicleFormInput,
): Promise<VehicleMutationResult> {
  const context = await requireOrganizationRole(
    organizationSlug,
    ["admin", "coordinator"] as const,
  );
  const supabase = await createClient();
  const { data: duplicate, error: duplicateError } = await supabase
    .from("vehicles")
    .select("id")
    .eq("organization_id", context.organization.id)
    .eq("plate", input.plate)
    .limit(1)
    .maybeSingle();

  if (duplicateError) return { success: false, reason: "unexpected" };
  if (duplicate) return { success: false, reason: "duplicate_plate" };

  const { data, error } = await supabase
    .from("vehicles")
    .insert({
      organization_id: context.organization.id,
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
      active: true,
      created_by: context.membership.profileId,
      updated_by: context.membership.profileId,
    })
    .select("id")
    .single();

  if (error) {
    return {
      success: false,
      reason: error.code === "23505" ? "duplicate_plate" : "unexpected",
    };
  }
  return { success: true, vehicleId: data.id };
}
