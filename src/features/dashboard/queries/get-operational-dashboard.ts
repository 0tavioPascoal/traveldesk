import "server-only";

import {
  buildDashboardDays,
  resolveDashboardPeriod,
} from "@/features/dashboard/helpers/dashboard-period";
import type {
  DashboardAlert,
  DashboardFilters,
  DashboardPriorityPoint,
  DashboardStatusPoint,
  OperationalDashboardData,
} from "@/features/dashboard/types/operational-dashboard";
import { requireOrganizationRole } from "@/features/organizations/application/require-organization-role";
import { evaluateTripOperationalIssues } from "@/features/trips/application/evaluate-trip-operational-issues";
import type { TripStatus } from "@/features/trips/types/trip";
import { createClient } from "@/lib/supabase/server";

const MAX_PERIOD_TRIPS = 250;
const MAX_RESOURCES = 500;
const MAX_UNAVAILABILITIES = 500;
const executionStatuses: TripStatus[] = [
  "traveling",
  "at_client",
  "in_service",
  "returning",
];

function hoursBetween(
  startsAt: string | null,
  endsAt: string | null,
  periodStart: number,
  periodEnd: number,
) {
  if (!startsAt || !endsAt) return 0;
  const start = Math.max(new Date(startsAt).getTime(), periodStart);
  const end = Math.min(new Date(endsAt).getTime(), periodEnd);
  return end > start ? (end - start) / 3_600_000 : 0;
}

function priorityDistribution(
  trips: Array<{ priority: "low" | "normal" | "high" | "urgent" }>,
): DashboardPriorityPoint[] {
  const priorities = [
    { key: "low" as const, label: "Baixa", tone: "muted" as const },
    { key: "normal" as const, label: "Normal", tone: "info" as const },
    { key: "high" as const, label: "Alta", tone: "warning" as const },
    { key: "urgent" as const, label: "Urgente", tone: "danger" as const },
  ];
  const total = trips.length;
  return priorities.map((priority) => {
    const count = trips.filter((trip) => trip.priority === priority.key).length;
    return {
      ...priority,
      count,
      percentage: total ? Math.round((count / total) * 100) : 0,
    };
  });
}

function statusDistribution(
  trips: Array<{ status: TripStatus }>,
): DashboardStatusPoint[] {
  const groups = [
    {
      key: "planning" as const,
      label: "Planejamento",
      statuses: ["draft", "planned"] as TripStatus[],
      tone: "neutral" as const,
    },
    {
      key: "confirmed" as const,
      label: "Confirmadas",
      statuses: ["confirmed"] as TripStatus[],
      tone: "info" as const,
    },
    {
      key: "execution" as const,
      label: "Em execução",
      statuses: executionStatuses,
      tone: "primary" as const,
    },
    {
      key: "finished" as const,
      label: "Concluídas",
      statuses: ["finished"] as TripStatus[],
      tone: "success" as const,
    },
    {
      key: "canceled" as const,
      label: "Canceladas",
      statuses: ["canceled"] as TripStatus[],
      tone: "danger" as const,
    },
  ];
  const total = trips.length;
  return groups.map((group) => {
    const count = trips.filter((trip) => group.statuses.includes(trip.status)).length;
    return {
      key: group.key,
      label: group.label,
      count,
      percentage: total ? Math.round((count / total) * 100) : 0,
      tone: group.tone,
    };
  });
}

export async function getOperationalDashboard(
  organizationSlug: string,
  filters: DashboardFilters,
  reference = new Date(),
): Promise<OperationalDashboardData> {
  const context = await requireOrganizationRole(
    organizationSlug,
    ["admin", "coordinator"] as const,
  );
  const timezone = context.organization.timezone;
  const period = resolveDashboardPeriod(filters.period, timezone, reference);
  const organizationId = context.organization.id;
  const supabase = await createClient();

  const [
    tripsResult,
    techniciansResult,
    vehiclesResult,
    technicianUnavailabilityResult,
    vehicleUnavailabilityResult,
  ] = await Promise.all([
    supabase.from("trips")
      .select("id, code, title, client_name_snapshot, client_unit_name_snapshot, travel_starts_at, travel_ends_at, priority, status")
      .eq("organization_id", organizationId)
      .lt("travel_starts_at", period.endsAt)
      .gt("travel_ends_at", period.startsAt)
      .order("travel_starts_at")
      .limit(MAX_PERIOD_TRIPS + 1),
    supabase.from("technicians")
      .select("id, name, active, can_drive_company_vehicle, driver_license_number, driver_license_category, driver_license_expires_at")
      .eq("organization_id", organizationId)
      .order("name")
      .limit(MAX_RESOURCES + 1),
    supabase.from("vehicles")
      .select("id, plate, passenger_capacity, active, operational_status")
      .eq("organization_id", organizationId)
      .order("plate")
      .limit(MAX_RESOURCES + 1),
    supabase.from("technician_unavailabilities")
      .select("id, technician_id, starts_at, ends_at")
      .eq("organization_id", organizationId)
      .eq("active", true)
      .lt("starts_at", period.endsAt)
      .gt("ends_at", period.startsAt)
      .limit(MAX_UNAVAILABILITIES + 1),
    supabase.from("vehicle_unavailabilities")
      .select("id, vehicle_id, starts_at, ends_at")
      .eq("organization_id", organizationId)
      .eq("active", true)
      .lt("starts_at", period.endsAt)
      .gt("ends_at", period.startsAt)
      .limit(MAX_UNAVAILABILITIES + 1),
  ]);
  const firstResults = [
    tripsResult,
    techniciansResult,
    vehiclesResult,
    technicianUnavailabilityResult,
    vehicleUnavailabilityResult,
  ];
  if (firstResults.some((result) => result.error)) {
    throw new Error("Não foi possível carregar o dashboard.");
  }

  const limited = (tripsResult.data?.length ?? 0) > MAX_PERIOD_TRIPS ||
    (techniciansResult.data?.length ?? 0) > MAX_RESOURCES ||
    (vehiclesResult.data?.length ?? 0) > MAX_RESOURCES ||
    (technicianUnavailabilityResult.data?.length ?? 0) > MAX_UNAVAILABILITIES ||
    (vehicleUnavailabilityResult.data?.length ?? 0) > MAX_UNAVAILABILITIES;
  const tripRows = (tripsResult.data ?? []).slice(0, MAX_PERIOD_TRIPS);
  const trips = tripRows.filter(
    (trip): trip is typeof trip & {
      travel_starts_at: string;
      travel_ends_at: string;
    } => Boolean(trip.travel_starts_at && trip.travel_ends_at),
  );
  const technicians = (techniciansResult.data ?? []).slice(0, MAX_RESOURCES);
  const vehicles = (vehiclesResult.data ?? []).slice(0, MAX_RESOURCES);
  const technicianUnavailabilities = (technicianUnavailabilityResult.data ?? [])
    .slice(0, MAX_UNAVAILABILITIES);
  const vehicleUnavailabilities = (vehicleUnavailabilityResult.data ?? [])
    .slice(0, MAX_UNAVAILABILITIES);
  const tripIds = trips.map((trip) => trip.id);
  const empty = Promise.resolve({ data: [], error: null });
  const [allocationsResult, assignmentsResult] = await Promise.all([
    tripIds.length
      ? supabase.from("trip_technicians")
        .select("trip_id, technician_id, is_responsible, occupancy_starts_at, occupancy_ends_at, blocks_schedule")
        .eq("organization_id", organizationId)
        .in("trip_id", tripIds)
        .limit(2500)
      : empty,
    tripIds.length
      ? supabase.from("trip_vehicle_assignments")
        .select("trip_id, vehicle_id, driver_technician_id, occupancy_starts_at, occupancy_ends_at, blocks_schedule")
        .eq("organization_id", organizationId)
        .in("trip_id", tripIds)
        .limit(MAX_PERIOD_TRIPS)
      : empty,
  ]);
  if (allocationsResult.error || assignmentsResult.error) {
    throw new Error("Não foi possível carregar as alocações do dashboard.");
  }
  const allocations = allocationsResult.data ?? [];
  const assignments = assignmentsResult.data ?? [];
  const technicianById = new Map(technicians.map((item) => [item.id, item]));
  const allocationsByTrip = new Map<string, typeof allocations>();
  for (const allocation of allocations) {
    const current = allocationsByTrip.get(allocation.trip_id) ?? [];
    current.push(allocation);
    allocationsByTrip.set(allocation.trip_id, current);
  }
  const issuesByTrip = evaluateTripOperationalIssues({
    trips,
    allocations,
    assignments,
    technicians,
    vehicles,
    technicianUnavailabilities,
    vehicleUnavailabilities,
    timezone,
  });
  const visibleTrips = trips.filter((trip) =>
    (filters.status === "all" || trip.status === filters.status) &&
    (filters.priority === "all" || trip.priority === filters.priority));
  const operationalTrips = visibleTrips.filter((trip) => trip.status !== "canceled");
  const operationalTripIds = new Set(operationalTrips.map((trip) => trip.id));
  const allocatedTechnicianIds = new Set(
    allocations
      .filter((item) => operationalTripIds.has(item.trip_id))
      .map((item) => item.technician_id),
  );
  const occupiedVehicleIds = new Set(
    assignments
      .filter((item) => operationalTripIds.has(item.trip_id))
      .map((item) => item.vehicle_id),
  );
  const activeTechnicianIds = new Set(
    technicians.filter((technician) => technician.active).map((technician) => technician.id),
  );
  const activeVehicleIds = new Set(
    vehicles.filter((vehicle) => vehicle.active).map((vehicle) => vehicle.id),
  );
  const allocatedActiveTechnicianIds = new Set(
    [...allocatedTechnicianIds].filter((id) => activeTechnicianIds.has(id)),
  );
  const occupiedActiveVehicleIds = new Set(
    [...occupiedVehicleIds].filter((id) => activeVehicleIds.has(id)),
  );
  const unavailableTechnicianIds = new Set(
    technicianUnavailabilities
      .map((item) => item.technician_id)
      .filter((id) => activeTechnicianIds.has(id)),
  );
  const unavailableVehicleIds = new Set(
    vehicleUnavailabilities
      .map((item) => item.vehicle_id)
      .filter((id) => activeVehicleIds.has(id)),
  );
  const conflictCount = operationalTrips.filter(
    (trip) => (issuesByTrip.get(trip.id)?.conflictLabels.length ?? 0) > 0,
  ).length;
  const pendingCount = visibleTrips.filter(
    (trip) => !["finished", "canceled"].includes(trip.status) &&
      (issuesByTrip.get(trip.id)?.pendingLabels.length ?? 0) > 0,
  ).length;

  const days = buildDashboardDays(period.startsAt, period.days, timezone);
  const tripsByDay = days.map((day) => ({
    date: day.date,
    weekday: day.weekday,
    dateLabel: day.dateLabel,
    count: visibleTrips.filter((trip) =>
      trip.travel_starts_at < day.endsAt && trip.travel_ends_at > day.startsAt).length,
  }));
  const periodStart = new Date(period.startsAt).getTime();
  const periodEnd = new Date(period.endsAt).getTime();
  const technicianLoad = new Map<string, {
    tripIds: Set<string>;
    hours: number;
  }>();
  for (const allocation of allocations) {
    if (!operationalTripIds.has(allocation.trip_id)) continue;
    const current = technicianLoad.get(allocation.technician_id) ?? {
      tripIds: new Set<string>(),
      hours: 0,
    };
    current.tripIds.add(allocation.trip_id);
    current.hours += hoursBetween(
      allocation.occupancy_starts_at,
      allocation.occupancy_ends_at,
      periodStart,
      periodEnd,
    );
    technicianLoad.set(allocation.technician_id, current);
  }
  const rankedTechnicians = [...technicianLoad.entries()]
    .map(([technicianId, load]) => ({
      technicianId,
      name: technicianById.get(technicianId)?.name ?? "Técnico",
      active: technicianById.get(technicianId)?.active ?? false,
      tripCount: load.tripIds.size,
      allocatedHours: Math.round(load.hours * 10) / 10,
    }))
    .sort((left, right) =>
      right.allocatedHours - left.allocatedHours ||
      right.tripCount - left.tripCount ||
      left.name.localeCompare(right.name, "pt-BR"))
    .slice(0, 5);
  const maximumHours = Math.max(
    1,
    ...rankedTechnicians.map((item) => item.allocatedHours),
  );
  const now = reference.getTime();
  const upcomingTrips = operationalTrips
    .filter((trip) => new Date(trip.travel_starts_at).getTime() >= now &&
      ["planned", "confirmed"].includes(trip.status))
    .sort((left, right) =>
      left.travel_starts_at.localeCompare(right.travel_starts_at))
    .slice(0, 5)
    .map((trip) => ({
      id: trip.id,
      code: trip.code,
      title: trip.title,
      clientName: trip.client_name_snapshot,
      unitName: trip.client_unit_name_snapshot,
      startsAt: trip.travel_starts_at,
      endsAt: trip.travel_ends_at,
      status: trip.status as TripStatus,
      priority: trip.priority,
      technicianNames: (allocationsByTrip.get(trip.id) ?? [])
        .map((item) => technicianById.get(item.technician_id)?.name ?? "Técnico"),
      href: `/app/${organizationSlug}/planejamento/viagens/${trip.id}`,
    }));

  const tripListParams = new URLSearchParams({
    startsOn: period.startDate,
    endsOn: period.endDate,
  });
  if (filters.status !== "all") tripListParams.set("status", filters.status);
  if (filters.priority !== "all") tripListParams.set("priority", filters.priority);
  const tripListHref =
    `/app/${organizationSlug}/planejamento/viagens?${tripListParams}`;
  const alerts: DashboardAlert[] = [
    conflictCount > 0 ? {
      id: "conflicts",
      title: "Conflitos operacionais",
      description: `${conflictCount} ${conflictCount === 1 ? "viagem exige" : "viagens exigem"} revisão de alocação ou transporte.`,
      count: conflictCount,
      level: "critical",
      href: tripListHref,
    } : null,
    pendingCount > 0 ? {
      id: "pending",
      title: "Planejamentos incompletos",
      description: `${pendingCount} ${pendingCount === 1 ? "viagem possui" : "viagens possuem"} equipe, responsável ou transporte pendente.`,
      count: pendingCount,
      level: "warning",
      href: tripListHref,
    } : null,
    visibleTrips.filter((trip) => trip.status === "planned").length > 0 ? {
      id: "confirmation",
      title: "Aguardando confirmação",
      description: "Viagens planejadas devem ter a prontidão revisada no detalhe.",
      count: visibleTrips.filter((trip) => trip.status === "planned").length,
      level: "info",
      href: `/app/${organizationSlug}/planejamento/viagens?status=planned&startsOn=${period.startDate}&endsOn=${period.endDate}`,
    } : null,
    technicianUnavailabilities.length + vehicleUnavailabilities.length > 0 ? {
      id: "unavailabilities",
      title: "Indisponibilidades no período",
      description: "Técnicos ou veículos possuem bloqueios que afetam o planejamento.",
      count: technicianUnavailabilities.length + vehicleUnavailabilities.length,
      level: "warning",
      href: `/app/${organizationSlug}/planejamento/indisponibilidades?startsOn=${period.startDate}&endsOn=${period.endDate}`,
    } : null,
  ].filter((item): item is DashboardAlert => item !== null).slice(0, 4);

  return {
    timezone,
    generatedAt: reference.toISOString(),
    limited,
    hasOperationalData: trips.length > 0 || technicians.length > 0 || vehicles.length > 0,
    filters,
    period: {
      startsAt: period.startsAt,
      endsAt: period.endsAt,
      startDate: period.startDate,
      endDate: period.endDate,
      label: period.label,
    },
    metrics: {
      trips: visibleTrips.length,
      allocatedTechnicians: allocatedTechnicianIds.size,
      conflicts: conflictCount,
      occupiedVehicles: occupiedVehicleIds.size,
      finishedTrips: visibleTrips.filter((trip) => trip.status === "finished").length,
    },
    tripsByDay,
    tripsByStatus: statusDistribution(visibleTrips),
    tripsByPriority: priorityDistribution(visibleTrips),
    resources: [
      {
        key: "technicians",
        label: "Técnicos",
        totalActive: activeTechnicianIds.size,
        allocated: allocatedActiveTechnicianIds.size,
        unavailable: unavailableTechnicianIds.size,
        allocationPercentage: activeTechnicianIds.size
          ? Math.round((allocatedActiveTechnicianIds.size / activeTechnicianIds.size) * 100)
          : 0,
        unavailabilityPercentage: activeTechnicianIds.size
          ? Math.round((unavailableTechnicianIds.size / activeTechnicianIds.size) * 100)
          : 0,
      },
      {
        key: "vehicles",
        label: "Veículos",
        totalActive: activeVehicleIds.size,
        allocated: occupiedActiveVehicleIds.size,
        unavailable: unavailableVehicleIds.size,
        allocationPercentage: activeVehicleIds.size
          ? Math.round((occupiedActiveVehicleIds.size / activeVehicleIds.size) * 100)
          : 0,
        unavailabilityPercentage: activeVehicleIds.size
          ? Math.round((unavailableVehicleIds.size / activeVehicleIds.size) * 100)
          : 0,
      },
    ],
    upcomingTrips,
    topTechnicians: rankedTechnicians.map((item) => ({
      id: item.technicianId,
      name: item.name,
      active: item.active,
      tripCount: item.tripCount,
      allocatedHours: item.allocatedHours,
      relativeLoad: Math.round((item.allocatedHours / maximumHours) * 100),
      href: `/app/${organizationSlug}/cadastros/tecnicos/${item.technicianId}`,
    })),
    alerts,
  };
}
