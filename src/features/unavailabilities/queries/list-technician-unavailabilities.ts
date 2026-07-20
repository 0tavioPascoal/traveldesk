import "server-only";

import { normalizeUnavailabilityFilterPeriod } from "@/features/unavailabilities/application/normalize-unavailability-period";
import type { UnavailabilityFilters, UnavailabilityListItem } from "@/features/unavailabilities/types/unavailability";
import { requireOrganizationRole } from "@/features/organizations/application/require-organization-role";
import { createClient } from "@/lib/supabase/server";

function quote(value: string) {
  return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

export async function listTechnicianUnavailabilities(
  organizationSlug: string,
  filters: UnavailabilityFilters,
): Promise<UnavailabilityListItem[]> {
  const context = await requireOrganizationRole(organizationSlug, ["admin", "coordinator"] as const);
  const supabase = await createClient();
  let matchingIds: string[] = [];
  if (filters.query) {
    const pattern = `%${filters.query.replace(/[\\%_]/g, "\\$&")}%`;
    const result = await supabase.from("technicians").select("id")
      .eq("organization_id", context.organization.id).ilike("name", pattern);
    if (result.error) throw new Error("Não foi possível pesquisar os técnicos.");
    matchingIds = result.data.map((item) => item.id);
  }

  let query = supabase.from("technician_unavailabilities").select(
    "id, technician_id, unavailability_type_id, starts_at, ends_at, all_day, reason, active, updated_at, technicians!inner(name, base_city, base_state), technician_unavailability_types!inner(name)",
  ).eq("organization_id", context.organization.id).order("starts_at", { ascending: false });
  if (filters.resourceId) query = query.eq("technician_id", filters.resourceId);
  if (filters.unavailabilityTypeId) query = query.eq("unavailability_type_id", filters.unavailabilityTypeId);
  if (filters.status !== "all") query = query.eq("active", filters.status === "active");
  const period = normalizeUnavailabilityFilterPeriod(filters.startsOn, filters.endsOn, context.organization.timezone);
  if (period.startsAt) query = query.gt("ends_at", period.startsAt);
  if (period.endsAt) query = query.lt("starts_at", period.endsAt);
  if (filters.query) {
    const pattern = `%${filters.query.replace(/[\\%_]/g, "\\$&")}%`;
    const clauses = [`reason.ilike.${quote(pattern)}`];
    if (matchingIds.length > 0) clauses.push(`technician_id.in.(${matchingIds.join(",")})`);
    query = query.or(clauses.join(","));
  }
  const { data, error } = await query;
  if (error) throw new Error("Não foi possível carregar as indisponibilidades dos técnicos.");
  return data.map((item) => ({
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
  }));
}
