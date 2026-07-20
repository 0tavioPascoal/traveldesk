import "server-only";

import type { AvailableVehicle } from "@/features/vehicles/types/vehicle";
import { requireOrganizationRole } from "@/features/organizations/application/require-organization-role";
import { createClient } from "@/lib/supabase/server";

export async function listAvailableVehicles(
  organizationSlug: string,
): Promise<AvailableVehicle[]> {
  const context = await requireOrganizationRole(
    organizationSlug,
    ["admin", "coordinator"] as const,
  );
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("vehicles")
    .select("id, plate, brand, model, passenger_capacity, base_city, base_state")
    .eq("organization_id", context.organization.id)
    .eq("active", true)
    .eq("operational_status", "available")
    .order("brand")
    .order("model");
  if (error) throw new Error("Não foi possível carregar os veículos disponíveis.");
  return data;
}
