import "server-only";

import type {
  TripDriverCandidate,
  TripVehicleAssignment,
  TripVehicleCandidate,
} from "@/features/trips/types/trip-transport";

const vehicleIssue = {
  inactive: "O veículo reservado está inativo.",
  maintenance: "O veículo reservado está em manutenção.",
  blocked: "O veículo reservado está bloqueado.",
  unavailability: "O veículo reservado possui indisponibilidade no período.",
  trip_conflict: "O veículo reservado conflita com outra viagem.",
  capacity: "O veículo reservado não comporta toda a equipe.",
} as const;
const driverIssue = {
  inactive: "O motorista está inativo.",
  not_authorized: "O motorista não está autorizado a dirigir veículo da empresa.",
  license_incomplete: "Os dados da CNH do motorista estão incompletos.",
  license_expired: "A CNH do motorista não permanece válida até o fim da viagem.",
  unavailability: "O motorista possui indisponibilidade no período.",
  trip_conflict: "O motorista conflita com outra viagem.",
} as const;

export function validateExistingTripTransport(
  assignment: TripVehicleAssignment | null,
  vehicles: TripVehicleCandidate[],
  drivers: TripDriverCandidate[],
  periodRequired: boolean,
) {
  if (!assignment) return { valid: true, issues: [] as string[] };
  const issues: string[] = [];
  if (periodRequired) issues.push("A viagem não possui um período válido para a reserva.");
  const vehicle = vehicles.find((item) => item.id === assignment.vehicleId);
  const driver = drivers.find((item) => item.technicianId === assignment.driverTechnicianId);
  if (!vehicle) issues.push("O veículo reservado não está acessível nesta organização.");
  else if (vehicle.unavailableReason) issues.push(vehicleIssue[vehicle.unavailableReason]);
  if (!driver) issues.push("O motorista reservado não faz parte da equipe.");
  else if (driver.ineligibleReason) issues.push(driverIssue[driver.ineligibleReason]);
  return { valid: issues.length === 0, issues };
}
