import "server-only";

import { requireOrganizationRole } from "@/features/organizations/application/require-organization-role";
import type { AvailabilityConflict } from "@/features/unavailabilities/types/unavailability";
import { createClient } from "@/lib/supabase/server";

export async function listVehicleUnavailabilitiesByPeriod(
  organizationSlug: string,
  vehicleId: string,
  startsAt: string,
  endsAt: string,
  excludeId?: string,
): Promise<AvailabilityConflict[]> {
  const context = await requireOrganizationRole(organizationSlug, ["admin", "coordinator"] as const);
  const supabase = await createClient();
  let query = supabase.from("vehicle_unavailabilities")
    .select("id, starts_at, ends_at, vehicle_unavailability_types!inner(name)")
    .eq("organization_id", context.organization.id)
    .eq("vehicle_id", vehicleId)
    .eq("active", true)
    .lt("starts_at", endsAt)
    .gt("ends_at", startsAt)
    .order("starts_at");
  if (excludeId) query = query.neq("id", excludeId);
  const { data, error } = await query;
  if (error) throw new Error("Não foi possível verificar a disponibilidade do veículo.");
  return data.map((item) => ({
    id: item.id,
    startsAt: item.starts_at,
    endsAt: item.ends_at,
    typeName: item.vehicle_unavailability_types.name,
  }));
}
