import "server-only";

import type { TripExecutionResult } from "@/features/trips/types/trip-execution";

export function mapTripExecutionError(error: { message: string }): Extract<TripExecutionResult, { success: false }> {
  const message = error.message;
  if (message.includes("trip_transition_not_found")) return { success: false, reason: "not_found" };
  if (message.includes("trip_transition_not_authorized")) return { success: false, reason: "not_authorized" };
  if (message.includes("trip_status_changed")) return { success: false, reason: "status_changed" };
  if (message.includes("trip_already_finished")) return { success: false, reason: "already_finished" };
  if (message.includes("trip_canceled")) return { success: false, reason: "canceled" };
  if (message.includes("trip_transition_note_invalid")) return { success: false, reason: "note_invalid" };
  if (message.includes("trip_invalid_transition")) return { success: false, reason: "invalid_transition" };
  return { success: false, reason: "unexpected" };
}

export function tripExecutionErrorMessage(reason: Exclude<TripExecutionResult, { success: true }>["reason"]): string {
  const messages = {
    not_found: "A viagem não foi encontrada ou não está acessível.",
    not_authorized: "Você não possui permissão para registrar esta etapa.",
    invalid_transition: "Esta etapa não pode ser registrada a partir do status atual.",
    status_changed: "O status foi alterado por outra pessoa. Atualize a página e tente novamente.",
    already_finished: "A viagem já foi finalizada.",
    canceled: "Uma viagem cancelada não pode continuar a execução.",
    note_invalid: "Revise a observação informada.",
    unexpected: "Não foi possível atualizar a execução da viagem.",
  } as const;
  return messages[reason];
}
