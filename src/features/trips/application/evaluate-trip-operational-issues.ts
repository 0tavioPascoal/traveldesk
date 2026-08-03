import type { TripStatus } from "@/features/trips/types/trip";

type OperationalTrip = {
  id: string;
  code: string;
  status: TripStatus;
  travel_starts_at: string;
  travel_ends_at: string;
};

type OperationalAllocation = {
  trip_id: string;
  technician_id: string;
  is_responsible: boolean;
  occupancy_starts_at: string | null;
  occupancy_ends_at: string | null;
  blocks_schedule: boolean;
};

type OperationalAssignment = {
  trip_id: string;
  vehicle_id: string;
  driver_technician_id: string;
  occupancy_starts_at: string | null;
  occupancy_ends_at: string | null;
  blocks_schedule: boolean;
};

type OperationalTechnician = {
  id: string;
  name: string;
  active: boolean;
  can_drive_company_vehicle: boolean;
  driver_license_number: string | null;
  driver_license_category: string | null;
  driver_license_expires_at: string | null;
};

type OperationalVehicle = {
  id: string;
  plate: string;
  passenger_capacity: number;
};

type TechnicianUnavailability = {
  technician_id: string;
  starts_at: string;
  ends_at: string;
};

type VehicleUnavailability = {
  vehicle_id: string;
  starts_at: string;
  ends_at: string;
};

export type TripOperationalIssues = {
  conflictLabels: string[];
  pendingLabels: string[];
};

function overlaps(
  leftStart: string | null,
  leftEnd: string | null,
  rightStart: string | null,
  rightEnd: string | null,
) {
  if (!leftStart || !leftEnd || !rightStart || !rightEnd) return false;
  return leftStart < rightEnd && leftEnd > rightStart;
}

function dateKeyInTimezone(value: string, timezone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(value));
  const part = (type: "year" | "month" | "day") =>
    parts.find((item) => item.type === type)?.value ?? "";
  return `${part("year")}-${part("month")}-${part("day")}`;
}

export function evaluateTripOperationalIssues({
  trips,
  allocations,
  assignments,
  technicians,
  vehicles,
  technicianUnavailabilities,
  vehicleUnavailabilities,
  timezone,
}: {
  trips: OperationalTrip[];
  allocations: OperationalAllocation[];
  assignments: OperationalAssignment[];
  technicians: OperationalTechnician[];
  vehicles: OperationalVehicle[];
  technicianUnavailabilities: TechnicianUnavailability[];
  vehicleUnavailabilities: VehicleUnavailability[];
  timezone: string;
}) {
  const technicianById = new Map(technicians.map((item) => [item.id, item]));
  const vehicleById = new Map(vehicles.map((item) => [item.id, item]));
  const allocationsByTrip = new Map<string, OperationalAllocation[]>();
  for (const allocation of allocations) {
    const current = allocationsByTrip.get(allocation.trip_id) ?? [];
    current.push(allocation);
    allocationsByTrip.set(allocation.trip_id, current);
  }
  const assignmentsByTrip = new Map(
    assignments.map((assignment) => [assignment.trip_id, assignment]),
  );
  const issues = new Map<string, TripOperationalIssues>();

  for (const trip of trips) {
    const team = allocationsByTrip.get(trip.id) ?? [];
    const assignment = assignmentsByTrip.get(trip.id);
    const responsible = team.find((item) => item.is_responsible);
    const vehicle = assignment ? vehicleById.get(assignment.vehicle_id) : null;
    const driver = assignment ? technicianById.get(assignment.driver_technician_id) : null;
    const conflictLabels: string[] = [];
    const pendingLabels: string[] = [];

    for (const member of team) {
      if (member.blocks_schedule && technicianUnavailabilities.some((item) =>
        item.technician_id === member.technician_id &&
        overlaps(
          member.occupancy_starts_at,
          member.occupancy_ends_at,
          item.starts_at,
          item.ends_at,
        ))) {
        conflictLabels.push(
          `Técnico indisponível: ${technicianById.get(member.technician_id)?.name ?? "Técnico"}`,
        );
      }
    }
    if (assignment?.blocks_schedule && vehicleUnavailabilities.some((item) =>
      item.vehicle_id === assignment.vehicle_id &&
      overlaps(
        assignment.occupancy_starts_at,
        assignment.occupancy_ends_at,
        item.starts_at,
        item.ends_at,
      ))) {
      conflictLabels.push(`Veículo indisponível: ${vehicle?.plate ?? "Veículo"}`);
    }
    if (assignment && vehicle && vehicle.passenger_capacity < team.length) {
      conflictLabels.push("Capacidade do veículo insuficiente");
    }
    if (assignment && (!driver?.active || !driver.can_drive_company_vehicle)) {
      conflictLabels.push("Motorista não elegível");
    }
    if (assignment && driver && (!driver.driver_license_number ||
      !driver.driver_license_category || !driver.driver_license_expires_at)) {
      conflictLabels.push("CNH do motorista incompleta");
    } else if (assignment && driver?.driver_license_expires_at &&
      driver.driver_license_expires_at <
        dateKeyInTimezone(trip.travel_ends_at, timezone)) {
      conflictLabels.push("CNH do motorista vencida");
    }

    if (!["finished", "canceled"].includes(trip.status)) {
      for (const other of trips) {
        if (other.id === trip.id || ["finished", "canceled"].includes(other.status)) continue;
        const otherTeam = allocationsByTrip.get(other.id) ?? [];
        if (team.some((member) => member.blocks_schedule &&
          otherTeam.some((item) =>
            item.blocks_schedule &&
            item.technician_id === member.technician_id &&
            overlaps(
              member.occupancy_starts_at,
              member.occupancy_ends_at,
              item.occupancy_starts_at,
              item.occupancy_ends_at,
            )))) {
          conflictLabels.push(`Equipe também alocada em ${other.code}`);
        }
        const otherAssignment = assignmentsByTrip.get(other.id);
        if (assignment?.blocks_schedule && otherAssignment?.blocks_schedule &&
          assignment.vehicle_id === otherAssignment.vehicle_id &&
          overlaps(
            assignment.occupancy_starts_at,
            assignment.occupancy_ends_at,
            otherAssignment.occupancy_starts_at,
            otherAssignment.occupancy_ends_at,
          )) {
          conflictLabels.push(`Veículo também reservado em ${other.code}`);
        }
      }
    }

    if (team.length === 0) pendingLabels.push("Equipe não definida");
    if (!responsible) pendingLabels.push("Responsável não definido");
    if (!assignment) pendingLabels.push("Veículo não definido");
    if (assignment && !driver) pendingLabels.push("Motorista não definido");

    issues.set(trip.id, {
      conflictLabels: [...new Set(conflictLabels)],
      pendingLabels,
    });
  }

  return issues;
}
