import "server-only";

import type { TripMutationResult } from "@/features/trips/types/trip";

export function tripActionMessage(reason: Extract<TripMutationResult, { success: false }>["reason"]) {
  return {
    client_not_available: "O cliente não está ativo ou não pertence à organização.",
    unit_not_available: "A unidade não está ativa, não pertence ao cliente ou à organização.",
    service_type_not_available: "O tipo de atendimento não está ativo ou não pertence à organização.",
    invalid_period: "Revise os períodos informados e o timezone da organização.",
    incomplete_for_planning: "Complete tipo de atendimento, períodos, origem e destino antes de planejar.",
    invalid_transition: "A alteração de status não é permitida no estado atual.",
    cancellation_reason_required: "Informe um motivo válido para cancelar a viagem.",
    restore_forbidden: "Somente administradores podem restaurar uma viagem cancelada.",
    technician_not_available: "Um técnico da equipe está inativo ou não está mais disponível.",
    technician_unavailable: "O novo período conflita com uma indisponibilidade da equipe.",
    technician_schedule_conflict: "O novo período conflita com outra viagem da equipe.",
    team_period_required: "A viagem precisa manter um período válido enquanto possuir equipe.",
    vehicle_not_available: "O veículo reservado não está ativo ou disponível.",
    vehicle_unavailable: "O novo período conflita com uma indisponibilidade do veículo.",
    vehicle_schedule_conflict: "O novo período conflita com outra reserva do veículo.",
    vehicle_capacity_exceeded: "O veículo reservado não comporta toda a equipe.",
    driver_not_allocated: "O motorista deve permanecer alocado na viagem.",
    driver_not_eligible: "O motorista reservado não está apto a dirigir.",
    driver_license_expired: "A CNH do motorista não permanece válida até o fim da viagem.",
    driver_unavailable: "O novo período torna o motorista indisponível.",
    not_found: "A viagem não foi encontrada.",
    unexpected: "Não foi possível concluir a operação. Tente novamente.",
  }[reason];
}
