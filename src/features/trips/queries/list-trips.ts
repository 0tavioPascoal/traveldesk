import "server-only";

import { normalizeTripFilterPeriod } from "@/features/trips/application/normalize-trip-periods";
import type { TripFilters, TripListResult } from "@/features/trips/types/trip";
import { requireOrganizationRole } from "@/features/organizations/application/require-organization-role";
import { createClient } from "@/lib/supabase/server";

function quote(value: string) { return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`; }
function pattern(value: string) { return `%${value.replace(/[\\%_]/g, "\\$&")}%`; }

export async function listTrips(organizationSlug: string, filters: TripFilters): Promise<TripListResult> {
  const context = await requireOrganizationRole(organizationSlug, ["admin", "coordinator"] as const);
  const supabase = await createClient();
  const pageSize = filters.pageSize;
  let query = supabase.from("trips").select(
    "id, code, title, client_name_snapshot, client_unit_name_snapshot, destination_city, destination_state, travel_starts_at, travel_ends_at, priority, status, updated_at, service_types(name)",
    { count: "exact" },
  ).eq("organization_id", context.organization.id).order("travel_starts_at", { ascending: false, nullsFirst: false }).order("updated_at", { ascending: false });
  if (filters.query) {
    const search = quote(pattern(filters.query));
    query = query.or([
      `code.ilike.${search}`, `title.ilike.${search}`, `client_name_snapshot.ilike.${search}`,
      `client_legal_name_snapshot.ilike.${search}`, `client_trade_name_snapshot.ilike.${search}`,
      `client_unit_name_snapshot.ilike.${search}`, `destination_city.ilike.${search}`, `reason.ilike.${search}`,
    ].join(","));
  }
  if (filters.status !== "all") query = query.eq("status", filters.status);
  if (filters.priority !== "all") query = query.eq("priority", filters.priority);
  const period = normalizeTripFilterPeriod(filters.startsOn, filters.endsOn, context.organization.timezone);
  if (period.startsAt) query = query.gt("travel_ends_at", period.startsAt);
  if (period.endsAt) query = query.lt("travel_starts_at", period.endsAt);
  const from = (filters.page - 1) * pageSize;
  const { data, error, count } = await query.range(from, from + pageSize - 1);
  if (error) throw new Error("Não foi possível carregar as viagens.");
  const total = count ?? 0;
  return {
    items: data.map(({ service_types: serviceType, ...trip }) => ({ ...trip, serviceTypeName: serviceType?.name ?? null })),
    page: filters.page,
    pageSize,
    total,
    totalPages: Math.ceil(total / pageSize),
  };
}
