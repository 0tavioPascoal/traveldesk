import "server-only";

import type { UnavailabilityListItem } from "@/features/unavailabilities/types/unavailability";
import { requireOrganizationRole } from "@/features/organizations/application/require-organization-role";
import { createClient } from "@/lib/supabase/server";

export async function listTechnicianUpcomingUnavailabilities(
  organizationSlug: string,
  technicianIds: string[],
): Promise<Map<string, UnavailabilityListItem[]>> {
  const context = await requireOrganizationRole(
    organizationSlug,
    ["admin", "coordinator"] as const,
  );
  const result = new Map<string, UnavailabilityListItem[]>();
  if (technicianIds.length === 0) return result;

  const now = new Date().toISOString();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("technician_unavailabilities")
    .select("id, technician_id, unavailability_type_id, starts_at, ends_at, all_day, reason, active, updated_at, technicians!inner(name, base_city, base_state), technician_unavailability_types!inner(name)")
    .eq("organization_id", context.organization.id)
    .eq("active", true)
    .in("technician_id", technicianIds)
    .gt("ends_at", now)
    .order("starts_at");
  if (error) throw new Error("Não foi possível carregar as indisponibilidades dos técnicos.");

  for (const item of data) {
    const values = result.get(item.technician_id) ?? [];
    values.push({
      id: item.id,
      resourceId: item.technician_id,
      resourceName: item.technicians.name,
      resourceDescription: `${item.technicians.base_city}/${item.technicians.base_state}`,
      typeId: item.unavailability_type_id,
      typeName: item.technician_unavailability_types.name,
      startsAt: item.starts_at,
      endsAt: item.ends_at,
      allDay: item.all_day,
      reason: item.reason,
      active: item.active,
      updatedAt: item.updated_at,
    });
    result.set(item.technician_id, values);
  }
  return result;
}
