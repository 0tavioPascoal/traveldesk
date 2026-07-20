import "server-only";

import { notFound } from "next/navigation";

import type { Vehicle } from "@/features/vehicles/types/vehicle";
import { requireOrganizationRole } from "@/features/organizations/application/require-organization-role";
import { createClient } from "@/lib/supabase/server";

export async function getVehicleById(
  organizationSlug: string,
  vehicleId: string,
): Promise<Vehicle> {
  const context = await requireOrganizationRole(
    organizationSlug,
    ["admin", "coordinator"] as const,
  );
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("vehicles")
    .select("id, plate, brand, model, manufacture_year, model_year, passenger_capacity, base_city, base_state, current_mileage, operational_status, licensing_expires_at, maintenance_due_at, notes, active, updated_at")
    .eq("organization_id", context.organization.id)
    .eq("id", vehicleId)
    .maybeSingle();

  if (error) throw new Error("Não foi possível carregar o veículo.");
  if (!data) notFound();
  return data;
}
