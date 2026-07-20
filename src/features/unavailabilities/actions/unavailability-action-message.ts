import "server-only";

import type { UnavailabilityMutationResult } from "@/features/unavailabilities/types/unavailability";

export function unavailabilityErrorMessage(
  reason: Extract<UnavailabilityMutationResult, { success: false }>["reason"],
) {
  const messages = {
    duplicate_name: "Já existe um registro com este nome.",
    overlap: "O período informado conflita com outra indisponibilidade ativa deste recurso.",
    resource_not_available: "O recurso selecionado não está ativo ou não pertence à organização.",
    type_not_available: "O tipo selecionado não está ativo ou não pertence à organização.",
    past_edit_forbidden: "Somente administradores podem corrigir uma indisponibilidade encerrada.",
    not_found: "A indisponibilidade não foi encontrada.",
    invalid_period: "O período informado é inválido para o timezone da organização.",
    unexpected: "Não foi possível concluir a operação. Tente novamente.",
  } as const;
  return messages[reason];
}
