import "server-only";

import { requireOrganizationRole } from "@/features/organizations/application/require-organization-role";
import type { DriverEligibilityReason, TripDriverCandidate } from "@/features/trips/types/trip-transport";
import { createClient } from "@/lib/supabase/server";

function dateInTimezone(value: string, timezone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(new Date(value));
  const get = (type: "year" | "month" | "day") => parts.find((part) => part.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

export async function listEligibleDriversForTrip(
  organizationSlug: string,
  tripId: string,
): Promise<{ periodRequired: boolean; items: TripDriverCandidate[] }> {
  const context = await requireOrganizationRole(organizationSlug, ["admin", "coordinator"] as const);
  const supabase = await createClient();
  const [tripResult, teamResult, assignmentResult] = await Promise.all([
    supabase.from("trips").select("travel_starts_at, travel_ends_at")
      .eq("organization_id", context.organization.id).eq("id", tripId).maybeSingle(),
    supabase.from("trip_technicians").select("technician_id, is_responsible")
      .eq("organization_id", context.organization.id).eq("trip_id", tripId),
    supabase.from("trip_vehicle_assignments").select("driver_technician_id")
      .eq("organization_id", context.organization.id).eq("trip_id", tripId).maybeSingle(),
  ]);
  if (tripResult.error || teamResult.error || assignmentResult.error) {
    throw new Error("Não foi possível carregar os motoristas da viagem.");
  }
  if (!tripResult.data) throw new Error("A viagem não foi encontrada.");
  if (!teamResult.data.length) return { periodRequired: !tripResult.data.travel_starts_at, items: [] };

  const technicianIds = teamResult.data.map((item) => item.technician_id);
  const techniciansResult = await supabase.from("technicians")
    .select("id, name, active, can_drive_company_vehicle, driver_license_number, driver_license_category, driver_license_expires_at")
    .eq("organization_id", context.organization.id).in("id", technicianIds).order("name");
  if (techniciansResult.error) throw new Error("Não foi possível carregar os dados dos motoristas.");

  const startsAt = tripResult.data.travel_starts_at;
  const endsAt = tripResult.data.travel_ends_at;
  const [unavailabilitiesResult, conflictsResult] = startsAt && endsAt
    ? await Promise.all([
        supabase.from("technician_unavailabilities").select("technician_id")
          .eq("organization_id", context.organization.id).eq("active", true)
          .in("technician_id", technicianIds).lt("starts_at", endsAt).gt("ends_at", startsAt),
        supabase.from("trip_technicians").select("technician_id")
          .eq("organization_id", context.organization.id).eq("blocks_schedule", true)
          .in("technician_id", technicianIds).neq("trip_id", tripId)
          .lt("occupancy_starts_at", endsAt).gt("occupancy_ends_at", startsAt),
      ])
    : [{ data: [], error: null }, { data: [], error: null }];
  if (unavailabilitiesResult.error || conflictsResult.error) {
    throw new Error("Não foi possível verificar a disponibilidade dos motoristas.");
  }
  const unavailable = new Set(unavailabilitiesResult.data.map((item) => item.technician_id));
  const conflicts = new Set(conflictsResult.data.map((item) => item.technician_id));
  const responsible = new Map(teamResult.data.map((item) => [item.technician_id, item.is_responsible]));
  const tripEndDate = endsAt ? dateInTimezone(endsAt, context.organization.timezone) : null;
  const currentDriverId = assignmentResult.data?.driver_technician_id ?? null;
  const items = techniciansResult.data.map((technician) => {
    let reason: DriverEligibilityReason | null = null;
    if (!technician.active) reason = "inactive";
    else if (!technician.can_drive_company_vehicle) reason = "not_authorized";
    else if (!technician.driver_license_number || !technician.driver_license_category
      || !technician.driver_license_expires_at) reason = "license_incomplete";
    else if (tripEndDate && technician.driver_license_expires_at < tripEndDate) reason = "license_expired";
    else if (unavailable.has(technician.id)) reason = "unavailability";
    else if (conflicts.has(technician.id)) reason = "trip_conflict";
    return {
      technicianId: technician.id,
      name: technician.name,
      isResponsible: responsible.get(technician.id) ?? false,
      canDriveCompanyVehicle: technician.can_drive_company_vehicle,
      driverLicenseCategory: technician.driver_license_category,
      driverLicenseExpiresAt: technician.driver_license_expires_at,
      group: reason ? "ineligible" as const : "eligible" as const,
      ineligibleReason: reason,
      currentlyAssigned: technician.id === currentDriverId,
    };
  }).sort((left, right) => Number(Boolean(left.ineligibleReason)) - Number(Boolean(right.ineligibleReason))
    || left.name.localeCompare(right.name, "pt-BR"));
  return { periodRequired: !startsAt || !endsAt, items };
}
