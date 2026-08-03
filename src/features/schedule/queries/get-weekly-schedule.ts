import "server-only";

import { requireOrganizationRole } from "@/features/organizations/application/require-organization-role";
import {
  getWeekPeriod,
  resolveWeekStart,
} from "@/features/schedule/application/schedule-calendar";
import type {
  ScheduleEvent,
  ScheduleFilters,
  ScheduleResourceOption,
  ScheduleTripEvent,
  ScheduleUnavailabilityEvent,
  WeeklyScheduleData,
} from "@/features/schedule/types/schedule";
import { evaluateTripOperationalIssues } from "@/features/trips/application/evaluate-trip-operational-issues";
import type { TripStatus } from "@/features/trips/types/trip";
import { createClient } from "@/lib/supabase/server";

const MAX_WEEK_TRIPS = 250;
const MAX_WEEK_UNAVAILABILITIES = 500;
const MAX_RESOURCES = 300;

export async function getWeeklySchedule(
  organizationSlug: string,
  requested: Omit<ScheduleFilters, "week"> & { week: string },
  reference = new Date(),
): Promise<WeeklyScheduleData> {
  const context = await requireOrganizationRole(
    organizationSlug,
    ["admin", "coordinator"] as const,
  );
  const timezone = context.organization.timezone;
  const weekStart = resolveWeekStart(requested.week, timezone, reference);
  const period = getWeekPeriod(weekStart, timezone);
  const supabase = await createClient();
  const organizationId = context.organization.id;

  const tripsQuery = supabase
    .from("trips")
    .select("id, code, title, client_name_snapshot, client_unit_name_snapshot, description, notes, travel_starts_at, travel_ends_at, service_starts_at, service_ends_at, priority, status")
    .eq("organization_id", organizationId)
    .lt("travel_starts_at", period.endsAt)
    .gt("travel_ends_at", period.startsAt)
    .order("travel_starts_at")
    .limit(MAX_WEEK_TRIPS + 1);
  const [
    tripsResult,
    techniciansResult,
    vehiclesResult,
    technicianUnavailabilityResult,
    vehicleUnavailabilityResult,
  ] = await Promise.all([
    tripsQuery,
    supabase.from("technicians")
      .select("id, name, active, can_drive_company_vehicle, driver_license_number, driver_license_category, driver_license_expires_at")
      .eq("organization_id", organizationId).order("name").limit(MAX_RESOURCES + 1),
    supabase.from("vehicles")
      .select("id, plate, brand, model, passenger_capacity, active, operational_status")
      .eq("organization_id", organizationId).order("brand").order("model").limit(MAX_RESOURCES + 1),
    supabase.from("technician_unavailabilities")
      .select("id, technician_id, starts_at, ends_at, all_day, reason, technicians!inner(name), technician_unavailability_types!inner(name)")
      .eq("organization_id", organizationId).eq("active", true)
      .lt("starts_at", period.endsAt).gt("ends_at", period.startsAt)
      .order("starts_at").limit(MAX_WEEK_UNAVAILABILITIES + 1),
    supabase.from("vehicle_unavailabilities")
      .select("id, vehicle_id, starts_at, ends_at, all_day, reason, vehicles!inner(plate, brand, model), vehicle_unavailability_types!inner(name)")
      .eq("organization_id", organizationId).eq("active", true)
      .lt("starts_at", period.endsAt).gt("ends_at", period.startsAt)
      .order("starts_at").limit(MAX_WEEK_UNAVAILABILITIES + 1),
  ]);

  const firstResults = [
    tripsResult, techniciansResult, vehiclesResult,
    technicianUnavailabilityResult, vehicleUnavailabilityResult,
  ];
  if (firstResults.some((result) => result.error)) {
    throw new Error("Não foi possível carregar a escala.");
  }

  const limited = (tripsResult.data?.length ?? 0) > MAX_WEEK_TRIPS ||
    (techniciansResult.data?.length ?? 0) > MAX_RESOURCES ||
    (vehiclesResult.data?.length ?? 0) > MAX_RESOURCES ||
    (technicianUnavailabilityResult.data?.length ?? 0) > MAX_WEEK_UNAVAILABILITIES ||
    (vehicleUnavailabilityResult.data?.length ?? 0) > MAX_WEEK_UNAVAILABILITIES;
  const rawTripRows = (tripsResult.data ?? []).slice(0, MAX_WEEK_TRIPS);
  const tripIds = rawTripRows.map((trip) => trip.id);
  const empty = Promise.resolve({ data: [], error: null });
  const [allocationsResult, assignmentsResult, requirementsResult, overnightsResult] =
    await Promise.all([
      tripIds.length
        ? supabase.from("trip_technicians")
          .select("trip_id, technician_id, is_responsible, occupancy_starts_at, occupancy_ends_at, blocks_schedule")
          .eq("organization_id", organizationId).in("trip_id", tripIds).limit(2000)
        : empty,
      tripIds.length
        ? supabase.from("trip_vehicle_assignments")
          .select("trip_id, vehicle_id, driver_technician_id, occupancy_starts_at, occupancy_ends_at, blocks_schedule")
          .eq("organization_id", organizationId).in("trip_id", tripIds).limit(MAX_WEEK_TRIPS)
        : empty,
      tripIds.length
        ? supabase.from("trip_required_skills")
          .select("trip_id, skills!inner(name)")
          .eq("organization_id", organizationId).in("trip_id", tripIds).limit(2000)
        : empty,
      tripIds.length
        ? supabase.from("trip_overnights")
          .select("trip_id, calculated_overnights, adjusted_overnights")
          .eq("organization_id", organizationId).in("trip_id", tripIds).limit(MAX_WEEK_TRIPS)
        : empty,
    ]);
  if ([allocationsResult, assignmentsResult, requirementsResult, overnightsResult]
    .some((result) => result.error)) {
    throw new Error("Não foi possível carregar as alocações da escala.");
  }

  const technicians = (techniciansResult.data ?? []).slice(0, MAX_RESOURCES);
  const vehicles = (vehiclesResult.data ?? []).slice(0, MAX_RESOURCES);
  const technicianById = new Map(technicians.map((item) => [item.id, item]));
  const vehicleById = new Map(vehicles.map((item) => [item.id, item]));
  const allocations = allocationsResult.data ?? [];
  const assignments = assignmentsResult.data ?? [];
  const requirements = requirementsResult.data ?? [];
  const overnights = overnightsResult.data ?? [];
  const technicianUnavailabilities = (technicianUnavailabilityResult.data ?? [])
    .slice(0, MAX_WEEK_UNAVAILABILITIES);
  const vehicleUnavailabilities = (vehicleUnavailabilityResult.data ?? [])
    .slice(0, MAX_WEEK_UNAVAILABILITIES);
  const rawTrips = rawTripRows.filter(
    (trip): trip is typeof trip & { travel_starts_at: string; travel_ends_at: string } =>
      Boolean(trip.travel_starts_at && trip.travel_ends_at),
  );
  const allocationsByTrip = new Map<string, typeof allocations>();
  for (const allocation of allocations) {
    const current = allocationsByTrip.get(allocation.trip_id) ?? [];
    current.push(allocation);
    allocationsByTrip.set(allocation.trip_id, current);
  }
  const assignmentsByTrip = new Map(
    assignments.map((assignment) => [assignment.trip_id, assignment]),
  );
  const issuesByTrip = evaluateTripOperationalIssues({
    trips: rawTrips,
    allocations,
    assignments,
    technicians,
    vehicles,
    technicianUnavailabilities,
    vehicleUnavailabilities,
    timezone,
  });

  const trips: ScheduleTripEvent[] = rawTrips.map((trip) => {
    const team = allocationsByTrip.get(trip.id) ?? [];
    const assignment = assignmentsByTrip.get(trip.id);
    const responsible = team.find((item) => item.is_responsible);
    const vehicle = assignment ? vehicleById.get(assignment.vehicle_id) : null;
    const driver = assignment ? technicianById.get(assignment.driver_technician_id) : null;
    const issues = issuesByTrip.get(trip.id) ?? {
      conflictLabels: [],
      pendingLabels: [],
    };

    const overnight = overnights.find((item) => item.trip_id === trip.id);
    return {
      id: trip.id,
      type: "trip",
      startsAt: trip.travel_starts_at,
      endsAt: trip.travel_ends_at,
      code: trip.code,
      title: trip.title,
      status: trip.status as TripStatus,
      priority: trip.priority,
      clientName: trip.client_name_snapshot,
      unitName: trip.client_unit_name_snapshot,
      description: trip.description,
      notes: trip.notes,
      serviceStartsAt: trip.service_starts_at,
      serviceEndsAt: trip.service_ends_at,
      technicianIds: team.map((item) => item.technician_id),
      technicianNames: team.map((item) => technicianById.get(item.technician_id)?.name ?? "Técnico"),
      responsibleName: responsible ? technicianById.get(responsible.technician_id)?.name ?? null : null,
      vehicleId: assignment?.vehicle_id ?? null,
      vehicleLabel: vehicle ? `${vehicle.brand} ${vehicle.model} · ${vehicle.plate}` : null,
      driverName: driver?.name ?? null,
      requiredSkills: requirements.filter((item) => item.trip_id === trip.id).map((item) => item.skills.name),
      overnights: overnight ? overnight.adjusted_overnights ?? overnight.calculated_overnights : null,
      conflictLabels: issues.conflictLabels,
      pendingLabels: issues.pendingLabels,
      href: `/app/${organizationSlug}/planejamento/viagens/${trip.id}`,
    };
  });

  const unavailabilities: ScheduleUnavailabilityEvent[] = [
    ...technicianUnavailabilities.map((item) => ({
      id: item.id,
      type: "technician_unavailability" as const,
      startsAt: item.starts_at,
      endsAt: item.ends_at,
      allDay: item.all_day,
      resourceId: item.technician_id,
      resourceName: item.technicians.name,
      typeName: item.technician_unavailability_types.name,
      reason: item.reason,
    })),
    ...vehicleUnavailabilities.map((item) => ({
      id: item.id,
      type: "vehicle_unavailability" as const,
      startsAt: item.starts_at,
      endsAt: item.ends_at,
      allDay: item.all_day,
      resourceId: item.vehicle_id,
      resourceName: `${item.vehicles.brand} ${item.vehicles.model} · ${item.vehicles.plate}`,
      typeName: item.vehicle_unavailability_types.name,
      reason: item.reason,
    })),
  ];

  const validTechnicianId = technicians.some((item) => item.id === requested.technicianId)
    ? requested.technicianId : "";
  const validVehicleId = vehicles.some((item) => item.id === requested.vehicleId)
    ? requested.vehicleId : "";
  const normalizedQuery = requested.query.toLocaleLowerCase("pt-BR");
  const visibleTrips = trips.filter((trip) => {
    if (requested.status !== "all" && trip.status !== requested.status) return false;
    if (validTechnicianId && !trip.technicianIds.includes(validTechnicianId)) return false;
    if (validVehicleId && trip.vehicleId !== validVehicleId) return false;
    if (requested.showConflicts && trip.conflictLabels.length === 0) return false;
    if (!normalizedQuery) return true;
    return [
      trip.code, trip.title, trip.clientName, trip.unitName,
      trip.responsibleName, trip.vehicleLabel, trip.driverName,
      ...trip.technicianNames,
    ].some((value) => value?.toLocaleLowerCase("pt-BR").includes(normalizedQuery));
  });
  const visibleUnavailabilities = requested.showUnavailabilities && !requested.showConflicts
    ? unavailabilities.filter((event) => {
        if (validTechnicianId && (event.type !== "technician_unavailability" || event.resourceId !== validTechnicianId)) return false;
        if (validVehicleId && (event.type !== "vehicle_unavailability" || event.resourceId !== validVehicleId)) return false;
        if (!normalizedQuery) return true;
        return [event.resourceName, event.typeName, event.reason]
          .some((value) => value?.toLocaleLowerCase("pt-BR").includes(normalizedQuery));
      })
    : [];
  const events: ScheduleEvent[] = [...visibleTrips, ...visibleUnavailabilities];

  return {
    timezone,
    generatedAt: reference.toISOString(),
    limited,
    weekStart,
    weekEnd: period.endKey,
    filters: {
      ...requested,
      week: weekStart,
      technicianId: validTechnicianId,
      vehicleId: validVehicleId,
    },
    events,
    technicians: technicians.map<ScheduleResourceOption>((item) => ({
      id: item.id, label: item.name, active: item.active,
    })),
    vehicles: vehicles.map<ScheduleResourceOption>((item) => ({
      id: item.id,
      label: `${item.brand} ${item.model} · ${item.plate}`,
      active: item.active,
    })),
    metrics: {
      trips: visibleTrips.length,
      allocatedTechnicians: new Set(visibleTrips.flatMap((trip) => trip.technicianIds)).size,
      conflicts: visibleTrips.filter((trip) => trip.conflictLabels.length > 0).length,
      occupiedVehicles: new Set(visibleTrips.flatMap((trip) => trip.vehicleId ? [trip.vehicleId] : [])).size,
    },
  };
}
