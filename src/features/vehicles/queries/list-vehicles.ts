import "server-only";

import { normalizePlate } from "@/features/vehicles/schemas/vehicle-schema";
import type { VehicleFilters, VehicleListItem } from "@/features/vehicles/types/vehicle";
import { requireOrganizationRole } from "@/features/organizations/application/require-organization-role";
import { createClient } from "@/lib/supabase/server";

const roles = ["admin", "coordinator"] as const;

function quoteFilterValue(value: string) {
  return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

function escapeLikePattern(value: string) {
  return value.replace(/[\\%_]/g, "\\$&");
}

export async function listVehicles(
  organizationSlug: string,
  filters: VehicleFilters,
): Promise<VehicleListItem[]> {
  const context = await requireOrganizationRole(organizationSlug, roles);
  const supabase = await createClient();
  let query = supabase
    .from("vehicles")
    .select("id, plate, brand, model, manufacture_year, model_year, passenger_capacity, base_city, base_state, current_mileage, operational_status, licensing_expires_at, maintenance_due_at, active, updated_at")
    .eq("organization_id", context.organization.id)
    .order("brand")
    .order("model")
    .order("plate");

  if (filters.query) {
    const pattern = `%${escapeLikePattern(filters.query)}%`;
    const normalizedPlate = normalizePlate(filters.query);
    query = query.or([
      `brand.ilike.${quoteFilterValue(pattern)}`,
      `model.ilike.${quoteFilterValue(pattern)}`,
      `base_city.ilike.${quoteFilterValue(pattern)}`,
      `plate.ilike.${quoteFilterValue(`%${escapeLikePattern(normalizedPlate)}%`)}`,
    ].join(","));
  }

  if (filters.activeState !== "all") {
    query = query.eq("active", filters.activeState === "active");
  }
  if (filters.operationalStatus !== "all") {
    query = query.eq("operational_status", filters.operationalStatus);
  }
  if (filters.baseState) query = query.eq("base_state", filters.baseState);

  const { data, error } = await query;
  if (error) throw new Error("Não foi possível carregar os veículos.");
  return data;
}
