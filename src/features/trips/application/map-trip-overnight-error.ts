import "server-only";

import type { TripOvernightMutationReason, TripOvernightMutationResult } from "@/features/trips/types/trip-overnight";

export function mapTripOvernightError(
  error: { message: string },
): Extract<TripOvernightMutationResult, { success: false }> {
  const message = error.message;
  if (message.includes("trip_overnight_not_editable")) return { success: false, reason: "not_editable" };
  if (message.includes("trip_overnight_period_required")) return { success: false, reason: "period_required" };
  if (message.includes("trip_overnight_invalid_timezone")) return { success: false, reason: "invalid_timezone" };
  if (message.includes("trip_overnight_not_calculated")) return { success: false, reason: "not_calculated" };
  if (message.includes("trip_overnight_stale")) return { success: false, reason: "stale" };
  if (message.includes("trip_overnight_invalid_adjustment")) return { success: false, reason: "invalid_adjustment" };
  if (message.includes("trip_overnight_adjustment_reason_required")) return { success: false, reason: "adjustment_reason_required" };
  if (message.includes("trip_overnight_not_found")) return { success: false, reason: "not_found" };
  return { success: false, reason: "unexpected" };
}

export function tripOvernightMessage(reason: TripOvernightMutationReason) {
  return {
    not_editable: "Os pernoites não podem ser alterados no estado atual da viagem.",
    period_required: "Defina um período válido para calcular os pernoites.",
    invalid_timezone: "O timezone da organização não é válido para o cálculo.",
    not_calculated: "O cálculo ainda não está disponível. Atualize-o e tente novamente.",
    stale: "O período ou o cálculo foi alterado. Atualize a página antes de continuar.",
    invalid_adjustment: "Informe uma quantidade válida de pernoites.",
    adjustment_reason_required: "Informe uma justificativa válida para o ajuste.",
    not_found: "A viagem ou o cálculo de pernoites não foi encontrado.",
    unexpected: "Não foi possível atualizar os pernoites. Tente novamente.",
  }[reason];
}
