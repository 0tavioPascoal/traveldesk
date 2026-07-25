import "server-only";

import type { TripTransportMutationResult } from "@/features/trips/types/trip-transport";

export function mapTripTransportError(
  error: { code?: string; message: string },
): Extract<TripTransportMutationResult, { success: false }> {
  const message = error.message;
  if (message.includes("trip_transport_not_editable")) return { success: false, reason: "not_editable" };
  if (message.includes("trip_transport_period_required")) return { success: false, reason: "period_required" };
  if (message.includes("trip_transport_team_required")) return { success: false, reason: "team_required" };
  if (message.includes("trip_vehicle_not_available")) return { success: false, reason: "vehicle_not_available" };
  if (message.includes("trip_vehicle_unavailable")) return { success: false, reason: "vehicle_unavailable" };
  if (message.includes("trip_vehicle_schedule_conflict") || error.code === "23P01") {
    return { success: false, reason: "vehicle_schedule_conflict" };
  }
  if (message.includes("trip_vehicle_capacity_exceeded")) return { success: false, reason: "capacity_exceeded" };
  if (message.includes("trip_driver_not_allocated")) return { success: false, reason: "driver_not_allocated" };
  if (message.includes("trip_driver_not_eligible")) return { success: false, reason: "driver_not_eligible" };
  if (message.includes("trip_driver_license_expired")) return { success: false, reason: "driver_license_expired" };
  if (message.includes("trip_driver_unavailable")) return { success: false, reason: "driver_unavailable" };
  if (message.includes("trip_transport_invalid")) return { success: false, reason: "invalid" };
  return { success: false, reason: "unexpected" };
}

export function tripTransportMessage(
  reason: Extract<TripTransportMutationResult, { success: false }>["reason"],
) {
  return {
    not_editable: "O transporte não pode ser alterado no estado atual da viagem.",
    period_required: "Defina o período da viagem antes de reservar o veículo.",
    team_required: "Adicione ao menos um técnico antes de reservar o veículo.",
    vehicle_not_available: "O veículo não está ativo, disponível ou não pertence à organização.",
    vehicle_unavailable: "O veículo possui uma indisponibilidade no período da viagem.",
    vehicle_schedule_conflict: "O veículo já está reservado em outra viagem nesse período.",
    capacity_exceeded: "O veículo não possui capacidade para toda a equipe.",
    driver_not_allocated: "O motorista deve fazer parte da equipe da viagem.",
    driver_not_eligible: "O técnico selecionado não está apto a dirigir veículo da empresa.",
    driver_license_expired: "A CNH do motorista não permanece válida até o fim da viagem.",
    driver_unavailable: "O motorista está indisponível no período da viagem.",
    not_found: "A reserva de transporte não foi encontrada.",
    invalid: "Revise os dados do transporte.",
    unexpected: "Não foi possível atualizar o transporte. Tente novamente.",
  }[reason];
}
