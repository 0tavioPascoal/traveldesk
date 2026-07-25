import "server-only";

import { normalizeTripFilterPeriod } from "@/features/trips/application/normalize-trip-periods";
import type { OperationalDashboardData } from "@/features/dashboard/types/operational-dashboard";
import { requireOrganizationRole } from "@/features/organizations/application/require-organization-role";
import type { TripListItem, TripStatus } from "@/features/trips/types/trip";
import { createClient } from "@/lib/supabase/server";

const executionStatuses = ["traveling", "at_client", "in_service", "returning"] as const;
const openStatuses = ["draft", "planned", "confirmed", ...executionStatuses] as const;

function dateInTimezone(value: Date, timezone: string) {
  const parts = new Intl.DateTimeFormat("en", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(value);
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((item) => item.type === type)?.value ?? "";
  return `${part("year")}-${part("month")}-${part("day")}`;
}

function mapTrips(data: Array<{
  id: string;
  code: string;
  title: string;
  client_name_snapshot: string;
  client_unit_name_snapshot: string;
  destination_city: string | null;
  destination_state: string | null;
  travel_starts_at: string | null;
  travel_ends_at: string | null;
  priority: "low" | "normal" | "high" | "urgent";
  status: TripStatus;
  updated_at: string;
  service_types: { name: string } | null;
}>): TripListItem[] {
  return data.map(({ service_types: serviceType, ...trip }) => ({ ...trip, serviceTypeName: serviceType?.name ?? null }));
}

export async function getOperationalDashboard(
  organizationSlug: string,
  reference = new Date(),
): Promise<OperationalDashboardData> {
  const context = await requireOrganizationRole(organizationSlug, ["admin", "coordinator"] as const);
  const supabase = await createClient();
  const organizationId = context.organization.id;
  const referenceTime = reference.toISOString();
  const referenceDate = dateInTimezone(reference, context.organization.timezone);
  const dayPeriod = normalizeTripFilterPeriod(referenceDate, referenceDate, context.organization.timezone);
  if (!dayPeriod.startsAt || !dayPeriod.endsAt) throw new Error("Não foi possível determinar o período operacional.");

  const tripFields = "id, code, title, client_name_snapshot, client_unit_name_snapshot, destination_city, destination_state, travel_starts_at, travel_ends_at, priority, status, updated_at, service_types(name)";
  const [
    todayResult,
    executionCountResult,
    plannedResult,
    draftResult,
    confirmedResult,
    urgentResult,
    activeTripsResult,
    upcomingTripsResult,
    techniciansResult,
    unavailableTechniciansResult,
    vehiclesResult,
    unavailableVehiclesResult,
    expiredLicensesResult,
  ] = await Promise.all([
    supabase.from("trips").select("id", { count: "exact", head: true }).eq("organization_id", organizationId).neq("status", "canceled").lt("travel_starts_at", dayPeriod.endsAt).gt("travel_ends_at", dayPeriod.startsAt),
    supabase.from("trips").select("id", { count: "exact", head: true }).eq("organization_id", organizationId).in("status", [...executionStatuses]),
    supabase.from("trips").select("id", { count: "exact", head: true }).eq("organization_id", organizationId).eq("status", "planned"),
    supabase.from("trips").select("id", { count: "exact", head: true }).eq("organization_id", organizationId).eq("status", "draft"),
    supabase.from("trips").select("id", { count: "exact", head: true }).eq("organization_id", organizationId).eq("status", "confirmed"),
    supabase.from("trips").select("id", { count: "exact", head: true }).eq("organization_id", organizationId).eq("priority", "urgent").in("status", [...openStatuses]),
    supabase.from("trips").select(tripFields).eq("organization_id", organizationId).in("status", [...executionStatuses]).order("travel_starts_at", { ascending: true, nullsFirst: false }).limit(6),
    supabase.from("trips").select(tripFields).eq("organization_id", organizationId).in("status", ["planned", "confirmed"]).gte("travel_ends_at", referenceTime).order("travel_starts_at", { ascending: true, nullsFirst: false }).limit(6),
    supabase.from("technicians").select("id", { count: "exact", head: true }).eq("organization_id", organizationId).eq("active", true),
    supabase.from("technician_unavailabilities").select("id", { count: "exact", head: true }).eq("organization_id", organizationId).eq("active", true).lte("starts_at", referenceTime).gt("ends_at", referenceTime),
    supabase.from("vehicles").select("id", { count: "exact", head: true }).eq("organization_id", organizationId).eq("active", true).eq("operational_status", "available"),
    supabase.from("vehicle_unavailabilities").select("id", { count: "exact", head: true }).eq("organization_id", organizationId).eq("active", true).lte("starts_at", referenceTime).gt("ends_at", referenceTime),
    supabase.from("technicians").select("id", { count: "exact", head: true }).eq("organization_id", organizationId).eq("active", true).eq("can_drive_company_vehicle", true).lt("driver_license_expires_at", referenceDate),
  ]);

  const results = [todayResult, executionCountResult, plannedResult, draftResult, confirmedResult, urgentResult, activeTripsResult, upcomingTripsResult, techniciansResult, unavailableTechniciansResult, vehiclesResult, unavailableVehiclesResult, expiredLicensesResult];
  if (results.some((result) => result.error)) throw new Error("Não foi possível carregar o resumo operacional.");

  return {
    referenceTime,
    referenceDate,
    timezone: context.organization.timezone,
    metrics: {
      tripsToday: todayResult.count ?? 0,
      inExecution: executionCountResult.count ?? 0,
      planned: plannedResult.count ?? 0,
      drafts: draftResult.count ?? 0,
      confirmed: confirmedResult.count ?? 0,
      urgentOpen: urgentResult.count ?? 0,
    },
    resources: {
      activeTechnicians: techniciansResult.count ?? 0,
      unavailableTechnicians: unavailableTechniciansResult.count ?? 0,
      availableVehicles: vehiclesResult.count ?? 0,
      unavailableVehicles: unavailableVehiclesResult.count ?? 0,
      expiredDriverLicenses: expiredLicensesResult.count ?? 0,
    },
    activeTrips: mapTrips(activeTripsResult.data ?? []),
    upcomingTrips: mapTrips(upcomingTripsResult.data ?? []),
  };
}
