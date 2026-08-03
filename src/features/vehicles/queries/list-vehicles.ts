import "server-only";

import { normalizePlate } from "@/features/vehicles/schemas/vehicle-schema";
import type { VehicleFilters, VehicleListResult } from "@/features/vehicles/types/vehicle";
import { listVehicleOperationalPeriods } from "@/features/vehicles/queries/list-vehicle-operational-periods";
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
): Promise<VehicleListResult> {
  const context = await requireOrganizationRole(organizationSlug, roles);
  const supabase = await createClient();
  const pageSize = filters.pageSize;
  let query = supabase
    .from("vehicles")
    .select("id, plate, brand, model, manufacture_year, model_year, passenger_capacity, base_city, base_state, current_mileage, operational_status, licensing_expires_at, maintenance_due_at, active, updated_at", { count: "exact" })
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
  if (filters.minimumCapacity) query = query.gte("passenger_capacity", Number(filters.minimumCapacity));

  const from = (filters.page - 1) * pageSize;
  const { data, error, count } = await query.range(from, from + pageSize - 1);
  if (error) throw new Error("Não foi possível carregar os veículos.");
  const periods = await listVehicleOperationalPeriods(organizationSlug, data.map((item) => item.id));
  const referenceTime = Date.now();
  const items = data.map((vehicle) => {
    const operationalPeriods = periods.get(vehicle.id) ?? { unavailabilities: [], reservations: [] };
    const currentUnavailability = operationalPeriods.unavailabilities.find((item) => new Date(item.startsAt).getTime() <= referenceTime);
    const currentReservation = operationalPeriods.reservations.find((item) => new Date(item.startsAt).getTime() <= referenceTime);
    const future = [
      ...operationalPeriods.unavailabilities.map((item) => ({ kind: "unavailability_future" as const, startsAt: item.startsAt, endsAt: item.endsAt })),
      ...operationalPeriods.reservations.map((item) => ({ kind: "reservation_future" as const, startsAt: item.startsAt, endsAt: item.endsAt })),
    ].sort((left, right) => left.startsAt.localeCompare(right.startsAt))[0];
    const availability = currentUnavailability
      ? { kind: "unavailability_current" as const, startsAt: currentUnavailability.startsAt, endsAt: currentUnavailability.endsAt }
      : currentReservation
        ? { kind: "reservation_current" as const, startsAt: currentReservation.startsAt, endsAt: currentReservation.endsAt }
        : future ?? null;
    return { ...vehicle, availability };
  });
  const total = count ?? 0;
  return { items, page: filters.page, pageSize, total, totalPages: Math.ceil(total / pageSize) };
}
