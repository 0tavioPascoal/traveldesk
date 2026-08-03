import "server-only";

import { buildAnalyticsIntervals, resolveAnalyticsPeriod } from "@/features/analytics/helpers/analytics-period";
import type {
  AnalyticsChartPoint,
  AnalyticsData,
  AnalyticsFilters,
  AnalyticsPriorityPoint,
  AnalyticsStatusPoint,
} from "@/features/analytics/types/analytics";
import { requireOrganizationRole } from "@/features/organizations/application/require-organization-role";
import type { TripPriority, TripStatus } from "@/features/trips/types/trip";
import { createClient } from "@/lib/supabase/server";

const MAX_TRIPS = 1000;
const MAX_OPTIONS = 1000;
const MAX_RELATIONSHIPS = 10000;
const executionStatuses: TripStatus[] = ["traveling", "at_client", "in_service", "returning"];

function hasOption(id: string, options: Array<{ id: string }>) {
  return id === "all" || options.some((option) => option.id === id);
}

function topPoints(
  entries: Array<[string, { label: string; tripIds: Set<string> }]>,
  limit = 10,
): AnalyticsChartPoint[] {
  return entries
    .map(([key, item]) => ({ key, label: item.label, value: item.tripIds.size }))
    .filter((item) => item.value > 0)
    .sort((left, right) => right.value - left.value || left.label.localeCompare(right.label, "pt-BR"))
    .slice(0, limit);
}

function statusDistribution(trips: Array<{ status: TripStatus }>): AnalyticsStatusPoint[] {
  const groups = [
    { key: "planning", label: "Planejamento", statuses: ["draft", "planned"] as TripStatus[], tone: "neutral" as const },
    { key: "confirmed", label: "Confirmadas", statuses: ["confirmed"] as TripStatus[], tone: "info" as const },
    { key: "execution", label: "Em execução", statuses: executionStatuses, tone: "primary" as const },
    { key: "finished", label: "Finalizadas", statuses: ["finished"] as TripStatus[], tone: "success" as const },
    { key: "canceled", label: "Canceladas", statuses: ["canceled"] as TripStatus[], tone: "danger" as const },
  ];
  const total = trips.length;
  return groups.map((group) => {
    const value = trips.filter((trip) => group.statuses.includes(trip.status)).length;
    return {
      key: group.key,
      label: group.label,
      value,
      percentage: total ? Math.round((value / total) * 100) : 0,
      tone: group.tone,
    };
  });
}

function priorityDistribution(trips: Array<{ priority: TripPriority }>): AnalyticsPriorityPoint[] {
  const priorities = [
    { key: "low" as const, label: "Baixa", tone: "muted" as const },
    { key: "normal" as const, label: "Normal", tone: "info" as const },
    { key: "high" as const, label: "Alta", tone: "warning" as const },
    { key: "urgent" as const, label: "Urgente", tone: "danger" as const },
  ];
  return priorities.map((priority) => ({
    ...priority,
    value: trips.filter((trip) => trip.priority === priority.key).length,
  }));
}

export async function getAnalyticsData(
  organizationSlug: string,
  requestedFilters: AnalyticsFilters,
  reference = new Date(),
): Promise<AnalyticsData> {
  const context = await requireOrganizationRole(
    organizationSlug,
    ["admin", "coordinator"] as const,
  );
  const organizationId = context.organization.id;
  const timezone = context.organization.timezone;
  const supabase = await createClient();

  const [clientsResult, unitsResult, techniciansResult, vehiclesResult, serviceTypesResult] = await Promise.all([
    supabase.from("clients")
      .select("id, legal_name, trade_name")
      .eq("organization_id", organizationId)
      .order("legal_name")
      .limit(MAX_OPTIONS + 1),
    supabase.from("client_units")
      .select("id, client_id, name")
      .eq("organization_id", organizationId)
      .order("name")
      .limit(MAX_OPTIONS + 1),
    supabase.from("technicians")
      .select("id, name, active")
      .eq("organization_id", organizationId)
      .order("name")
      .limit(MAX_OPTIONS + 1),
    supabase.from("vehicles")
      .select("id, plate, brand, model, active")
      .eq("organization_id", organizationId)
      .order("plate")
      .limit(MAX_OPTIONS + 1),
    supabase.from("service_types")
      .select("id, name")
      .eq("organization_id", organizationId)
      .order("name")
      .limit(MAX_OPTIONS + 1),
  ]);
  if ([clientsResult, unitsResult, techniciansResult, vehiclesResult, serviceTypesResult]
    .some((result) => result.error)) {
    throw new Error("Não foi possível carregar os filtros das análises.");
  }

  const clientRows = (clientsResult.data ?? []).slice(0, MAX_OPTIONS);
  const unitRows = (unitsResult.data ?? []).slice(0, MAX_OPTIONS);
  const technicianRows = (techniciansResult.data ?? []).slice(0, MAX_OPTIONS);
  const vehicleRows = (vehiclesResult.data ?? []).slice(0, MAX_OPTIONS);
  const serviceTypeRows = (serviceTypesResult.data ?? []).slice(0, MAX_OPTIONS);
  const options = {
    clients: clientRows.map((client) => ({
      id: client.id,
      label: client.trade_name ?? client.legal_name,
    })),
    units: unitRows.map((unit) => ({ id: unit.id, clientId: unit.client_id, label: unit.name })),
    technicians: technicianRows.map((technician) => ({ id: technician.id, label: technician.name })),
    vehicles: vehicleRows.map((vehicle) => ({
      id: vehicle.id,
      label: `${vehicle.plate} — ${vehicle.brand} ${vehicle.model}`,
    })),
    serviceTypes: serviceTypeRows.map((serviceType) => ({ id: serviceType.id, label: serviceType.name })),
  };

  const clientId = hasOption(requestedFilters.clientId, options.clients)
    ? requestedFilters.clientId
    : "all";
  const selectedUnit = options.units.find((unit) => unit.id === requestedFilters.unitId);
  const unitId = selectedUnit && (clientId === "all" || selectedUnit.clientId === clientId)
    ? selectedUnit.id
    : "all";
  const technicianId = hasOption(requestedFilters.technicianId, options.technicians)
    ? requestedFilters.technicianId
    : "all";
  const vehicleId = hasOption(requestedFilters.vehicleId, options.vehicles)
    ? requestedFilters.vehicleId
    : "all";
  const serviceTypeId = hasOption(requestedFilters.serviceTypeId, options.serviceTypes)
    ? requestedFilters.serviceTypeId
    : "all";
  const resolvedPeriod = resolveAnalyticsPeriod(requestedFilters, timezone, reference);
  const filters: AnalyticsFilters = {
    ...requestedFilters,
    period: resolvedPeriod.period,
    startDate: resolvedPeriod.startDate,
    endDate: resolvedPeriod.endDate,
    clientId,
    unitId,
    technicianId,
    vehicleId,
    serviceTypeId,
  };

  let tripsQuery = supabase.from("trips")
    .select("id, client_id, client_name_snapshot, service_type_id, priority, status, travel_starts_at, travel_ends_at")
    .eq("organization_id", organizationId)
    .lt("travel_starts_at", resolvedPeriod.endsAt)
    .gt("travel_ends_at", resolvedPeriod.startsAt)
    .order("travel_starts_at")
    .limit(MAX_TRIPS + 1);
  if (clientId !== "all") tripsQuery = tripsQuery.eq("client_id", clientId);
  if (unitId !== "all") tripsQuery = tripsQuery.eq("client_unit_id", unitId);
  if (filters.status !== "all") tripsQuery = tripsQuery.eq("status", filters.status);
  if (filters.priority !== "all") tripsQuery = tripsQuery.eq("priority", filters.priority);
  if (serviceTypeId !== "all") tripsQuery = tripsQuery.eq("service_type_id", serviceTypeId);

  const tripsResult = await tripsQuery;
  if (tripsResult.error) throw new Error("Não foi possível carregar as análises.");
  const tripRows = (tripsResult.data ?? []).slice(0, MAX_TRIPS).filter(
    (trip): trip is typeof trip & { travel_starts_at: string; travel_ends_at: string } =>
      Boolean(trip.travel_starts_at && trip.travel_ends_at),
  );
  const tripIds = tripRows.map((trip) => trip.id);
  const empty = Promise.resolve({ data: [], error: null });
  const [allocationsResult, assignmentsResult] = await Promise.all([
    tripIds.length
      ? supabase.from("trip_technicians")
        .select("trip_id, technician_id")
        .eq("organization_id", organizationId)
        .in("trip_id", tripIds)
        .limit(MAX_RELATIONSHIPS + 1)
      : empty,
    tripIds.length
      ? supabase.from("trip_vehicle_assignments")
        .select("trip_id, vehicle_id")
        .eq("organization_id", organizationId)
        .in("trip_id", tripIds)
        .limit(MAX_RELATIONSHIPS + 1)
      : empty,
  ]);
  if (allocationsResult.error || assignmentsResult.error) {
    throw new Error("Não foi possível carregar os vínculos das análises.");
  }
  const allocations = (allocationsResult.data ?? []).slice(0, MAX_RELATIONSHIPS);
  const assignments = (assignmentsResult.data ?? []).slice(0, MAX_RELATIONSHIPS);
  const technicianTripIds = technicianId === "all"
    ? null
    : new Set(allocations.filter((item) => item.technician_id === technicianId).map((item) => item.trip_id));
  const vehicleTripIds = vehicleId === "all"
    ? null
    : new Set(assignments.filter((item) => item.vehicle_id === vehicleId).map((item) => item.trip_id));
  const trips = tripRows.filter((trip) =>
    (!technicianTripIds || technicianTripIds.has(trip.id)) &&
    (!vehicleTripIds || vehicleTripIds.has(trip.id)));
  const visibleTripIds = new Set(trips.map((trip) => trip.id));
  const operationalTripIds = new Set(
    trips.filter((trip) => trip.status !== "canceled").map((trip) => trip.id),
  );
  const visibleAllocations = allocations.filter((item) => visibleTripIds.has(item.trip_id));
  const visibleAssignments = assignments.filter((item) => visibleTripIds.has(item.trip_id));
  const operationalAllocations = visibleAllocations.filter((item) => operationalTripIds.has(item.trip_id));
  const operationalAssignments = visibleAssignments.filter((item) => operationalTripIds.has(item.trip_id));

  const tripsByPeriod = buildAnalyticsIntervals(resolvedPeriod, timezone).map((point) => ({
    ...point,
    value: trips.filter((trip) =>
      trip.travel_starts_at < point.endsAt && trip.travel_ends_at > point.startsAt).length,
  }));
  const clientGroups = new Map<string, { label: string; tripIds: Set<string> }>();
  const serviceTypeGroups = new Map<string, { label: string; tripIds: Set<string> }>();
  const clientById = new Map(options.clients.map((item) => [item.id, item.label]));
  const serviceTypeById = new Map(options.serviceTypes.map((item) => [item.id, item.label]));
  for (const trip of trips) {
    const client = clientGroups.get(trip.client_id) ?? {
      label: clientById.get(trip.client_id) ?? trip.client_name_snapshot,
      tripIds: new Set<string>(),
    };
    client.tripIds.add(trip.id);
    clientGroups.set(trip.client_id, client);
    const serviceTypeKey = trip.service_type_id ?? "not-informed";
    const serviceType = serviceTypeGroups.get(serviceTypeKey) ?? {
      label: trip.service_type_id
        ? serviceTypeById.get(trip.service_type_id) ?? "Tipo indisponível"
        : "Não informado",
      tripIds: new Set<string>(),
    };
    serviceType.tripIds.add(trip.id);
    serviceTypeGroups.set(serviceTypeKey, serviceType);
  }

  const technicianById = new Map(options.technicians.map((item) => [item.id, item.label]));
  const technicianGroups = new Map<string, { label: string; tripIds: Set<string> }>();
  for (const allocation of operationalAllocations) {
    const group = technicianGroups.get(allocation.technician_id) ?? {
      label: technicianById.get(allocation.technician_id) ?? "Técnico indisponível",
      tripIds: new Set<string>(),
    };
    group.tripIds.add(allocation.trip_id);
    technicianGroups.set(allocation.technician_id, group);
  }
  const vehicleById = new Map(options.vehicles.map((item) => [item.id, item.label]));
  const vehicleGroups = new Map<string, { label: string; tripIds: Set<string> }>();
  for (const assignment of operationalAssignments) {
    const group = vehicleGroups.get(assignment.vehicle_id) ?? {
      label: vehicleById.get(assignment.vehicle_id) ?? "Veículo indisponível",
      tripIds: new Set<string>(),
    };
    group.tripIds.add(assignment.trip_id);
    vehicleGroups.set(assignment.vehicle_id, group);
  }

  const limited = (tripsResult.data?.length ?? 0) > MAX_TRIPS ||
    (allocationsResult.data?.length ?? 0) > MAX_RELATIONSHIPS ||
    (assignmentsResult.data?.length ?? 0) > MAX_RELATIONSHIPS ||
    [clientsResult, unitsResult, techniciansResult, vehiclesResult, serviceTypesResult]
      .some((result) => (result.data?.length ?? 0) > MAX_OPTIONS);

  return {
    timezone,
    limited,
    filters,
    options,
    period: {
      startsAt: resolvedPeriod.startsAt,
      endsAt: resolvedPeriod.endsAt,
      startDate: resolvedPeriod.startDate,
      endDate: resolvedPeriod.endDate,
      label: resolvedPeriod.label,
      granularity: resolvedPeriod.granularity,
    },
    tripsByPeriod,
    tripsByStatus: statusDistribution(trips),
    tripsByClient: topPoints([...clientGroups.entries()]),
    tripsByServiceType: topPoints([...serviceTypeGroups.entries()]),
    tripsByPriority: priorityDistribution(trips),
    resourceUsage: [
      {
        key: "technicians",
        label: "Técnicos",
        active: technicianRows.filter((item) => item.active).length,
        used: new Set(operationalAllocations.map((item) => item.technician_id)).size,
      },
      {
        key: "vehicles",
        label: "Veículos",
        active: vehicleRows.filter((item) => item.active).length,
        used: new Set(operationalAssignments.map((item) => item.vehicle_id)).size,
      },
    ],
    tripsByTechnician: topPoints([...technicianGroups.entries()]),
    tripsByVehicle: topPoints([...vehicleGroups.entries()]),
    totalTrips: trips.length,
  };
}
