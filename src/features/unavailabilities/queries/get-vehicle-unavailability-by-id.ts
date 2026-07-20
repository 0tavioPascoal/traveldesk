import "server-only";

import { requireOrganizationRole } from "@/features/organizations/application/require-organization-role";
import type { UnavailabilityDetails } from "@/features/unavailabilities/types/unavailability";
import { createClient } from "@/lib/supabase/server";

export async function getVehicleUnavailabilityById(
  organizationSlug: string,
  id: string,
): Promise<UnavailabilityDetails | null> {
  const context = await requireOrganizationRole(organizationSlug, ["admin", "coordinator"] as const);
  const supabase = await createClient();
  const { data, error } = await supabase.from("vehicle_unavailabilities").select(
    "id, vehicle_id, unavailability_type_id, starts_at, ends_at, all_day, reason, notes, active, updated_at, vehicles!inner(plate, brand, model), vehicle_unavailability_types!inner(name)",
  ).eq("organization_id", context.organization.id).eq("id", id).maybeSingle();
  if (error) throw new Error("Não foi possível carregar a indisponibilidade.");
  if (!data) return null;
  return {
    id: data.id,
    resourceId: data.vehicle_id,
    resourceName: `${data.vehicles.brand} ${data.vehicles.model}`,
    resourceDescription: data.vehicles.plate,
    typeId: data.unavailability_type_id,
    typeName: data.vehicle_unavailability_types.name,
    startsAt: data.starts_at,
    endsAt: data.ends_at,
    allDay: data.all_day,
    reason: data.reason,
    notes: data.notes,
    active: data.active,
    updatedAt: data.updated_at,
  };
}
