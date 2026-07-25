import "server-only";

import type { TripStaffingMutationResult } from "@/features/trips/types/trip-staffing";

export function mapTripStaffingError(
  error: { code?: string; message: string },
): Extract<TripStaffingMutationResult, { success: false }> {
  const message = error.message;
  if (message.includes("trip_not_editable")) return { success: false, reason: "not_editable" };
  if (message.includes("trip_period_required")) return { success: false, reason: "period_required" };
  if (message.includes("trip_skill_not_available")) return { success: false, reason: "skill_not_available" };
  if (message.includes("trip_technician_not_available")) return { success: false, reason: "technician_not_available" };
  if (message.includes("trip_technician_unavailable")) return { success: false, reason: "technician_unavailable" };
  if (message.includes("trip_technician_schedule_conflict") || error.code === "23P01") {
    return { success: false, reason: "schedule_conflict" };
  }
  if (message.includes("trip_invalid_requirements")) return { success: false, reason: "invalid_requirements" };
  if (message.includes("trip_invalid_team")) return { success: false, reason: "invalid_team" };
  if (message.includes("trip_responsible_not_allocated")) return { success: false, reason: "responsible_not_allocated" };
  if (message.includes("trip_driver_assigned")) return { success: false, reason: "driver_assigned" };
  if (message.includes("trip_vehicle_capacity_exceeded")) return { success: false, reason: "vehicle_capacity_exceeded" };
  return { success: false, reason: "unexpected" };
}

export function tripStaffingMessage(
  reason: Extract<TripStaffingMutationResult, { success: false }>["reason"],
) {
  return {
    not_editable: "A equipe não pode ser alterada no estado atual da viagem.",
    period_required: "Defina o período da viagem antes de alocar a equipe.",
    skill_not_available: "Uma especialidade não está ativa ou não pertence à organização.",
    technician_not_available: "Um técnico não está ativo ou não pertence à organização.",
    technician_unavailable: "Um técnico está indisponível no período da viagem.",
    schedule_conflict: "Um técnico já está alocado em outra viagem nesse período.",
    invalid_requirements: "Revise os requisitos técnicos informados.",
    invalid_team: "Revise os técnicos e a definição do responsável.",
    responsible_not_allocated: "O responsável deve fazer parte da equipe e estar ativo.",
    driver_assigned: "Remova ou substitua o transporte antes de retirar o motorista da equipe.",
    vehicle_capacity_exceeded: "A equipe excede a capacidade do veículo reservado.",
    unexpected: "Não foi possível concluir a operação. Tente novamente.",
  }[reason];
}
