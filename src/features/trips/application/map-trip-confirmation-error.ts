import "server-only";

import type { TripConfirmationReason, TripConfirmationResult } from "@/features/trips/types/trip-confirmation";

export function mapTripConfirmationError(
  error: { message: string },
): Extract<TripConfirmationResult, { success: false }> {
  const message = error.message;
  if (message.includes("trip_confirmation_not_found")) return { success: false, reason: "not_found" };
  if (message.includes("trip_confirmation_not_planned")) return { success: false, reason: "not_planned" };
  if (message.includes("trip_confirmation_main_data_incomplete")) return { success: false, reason: "main_data_incomplete" };
  if (message.includes("trip_confirmation_invalid_period")) return { success: false, reason: "invalid_period" };
  if (message.includes("trip_confirmation_client_inactive")) return { success: false, reason: "client_inactive" };
  if (message.includes("trip_confirmation_unit_inactive")) return { success: false, reason: "unit_inactive" };
  if (message.includes("trip_confirmation_service_type_inactive")) return { success: false, reason: "service_type_inactive" };
  if (message.includes("trip_confirmation_team_required")) return { success: false, reason: "team_required" };
  if (message.includes("trip_confirmation_responsible_required")) return { success: false, reason: "responsible_required" };
  if (message.includes("trip_confirmation_skill_coverage_incomplete")) return { success: false, reason: "skill_coverage_incomplete" };
  if (message.includes("trip_confirmation_technician_inactive")) return { success: false, reason: "technician_inactive" };
  if (message.includes("trip_confirmation_technician_unavailable")) return { success: false, reason: "technician_unavailable" };
  if (message.includes("trip_confirmation_technician_schedule_conflict")) return { success: false, reason: "technician_schedule_conflict" };
  if (message.includes("trip_confirmation_transport_required")) return { success: false, reason: "transport_required" };
  if (message.includes("trip_vehicle_not_available") || message.includes("trip_vehicle_unavailable")) return { success: false, reason: "vehicle_unavailable" };
  if (message.includes("trip_vehicle_schedule_conflict")) return { success: false, reason: "vehicle_schedule_conflict" };
  if (message.includes("trip_vehicle_capacity_exceeded")) return { success: false, reason: "capacity_insufficient" };
  if (message.includes("trip_driver_not_allocated")) return { success: false, reason: "driver_not_allocated" };
  if (message.includes("trip_driver_not_eligible")) return { success: false, reason: "driver_not_eligible" };
  if (message.includes("trip_driver_license_expired")) return { success: false, reason: "driver_license_invalid" };
  if (message.includes("trip_driver_unavailable")) return { success: false, reason: "technician_unavailable" };
  if (message.includes("trip_confirmation_overnights_missing")) return { success: false, reason: "overnights_missing" };
  if (message.includes("trip_confirmation_overnights_outdated")) return { success: false, reason: "overnights_outdated" };
  if (message.includes("trip_confirmation_overnights_not_reviewed")) return { success: false, reason: "overnights_not_reviewed" };
  return { success: false, reason: "unexpected" };
}

export function tripConfirmationMessage(reason: TripConfirmationReason) {
  return {
    not_found: "A viagem não foi encontrada ou não pertence à organização.",
    not_planned: "Somente uma viagem planejada pode ser confirmada.",
    main_data_incomplete: "Complete os dados principais da viagem antes de confirmar.",
    invalid_period: "Revise os períodos da viagem e do atendimento.",
    client_inactive: "O cliente está inativo ou não pertence à organização.",
    unit_inactive: "A unidade está inativa ou não pertence ao cliente.",
    service_type_inactive: "O tipo de atendimento está inativo ou não pertence à organização.",
    team_required: "Adicione ao menos um técnico à viagem.",
    responsible_required: "Defina exatamente um técnico responsável.",
    skill_coverage_incomplete: "A equipe ainda não cobre todas as especialidades exigidas.",
    technician_inactive: "Um técnico da equipe está inativo.",
    technician_unavailable: "Um técnico da equipe está indisponível no período.",
    technician_schedule_conflict: "Um técnico da equipe possui conflito com outra viagem.",
    transport_required: "Reserve um veículo e defina o motorista.",
    vehicle_unavailable: "O veículo não está disponível para confirmação.",
    vehicle_schedule_conflict: "O veículo possui conflito com outra viagem.",
    capacity_insufficient: "O veículo não comporta toda a equipe.",
    driver_not_allocated: "O motorista deve fazer parte da equipe.",
    driver_not_eligible: "O motorista não está apto a dirigir veículo da empresa.",
    driver_license_invalid: "A CNH do motorista não permanece válida até o fim da viagem.",
    overnights_missing: "Calcule os pernoites antes de confirmar.",
    overnights_outdated: "O cálculo de pernoites está desatualizado.",
    overnights_not_reviewed: "Revise os pernoites antes de confirmar.",
    unexpected: "Não foi possível confirmar a viagem. Atualize a página e tente novamente.",
  }[reason];
}
