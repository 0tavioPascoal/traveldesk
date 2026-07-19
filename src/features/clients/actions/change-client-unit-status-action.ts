"use server";

import { revalidatePath } from "next/cache";

import { changeClientUnitStatus } from "@/features/clients/application/change-client-unit-status";
import { clientUnitStatusSchema } from "@/features/clients/schemas/client-unit-schema";
import type { ClientStatusActionState } from "@/features/clients/types/client";

export async function changeClientUnitStatusAction(
  organizationSlug: string,
  clientId: string,
  unitId: string,
  active: boolean,
  _previousState: ClientStatusActionState,
  _formData: FormData,
): Promise<ClientStatusActionState> {
  void _previousState;
  void _formData;

  const validationResult = clientUnitStatusSchema.safeParse({
    clientId,
    unitId,
    active,
  });

  if (!validationResult.success) {
    return { status: "error", message: "Não foi possível identificar a unidade." };
  }

  const result = await changeClientUnitStatus(
    organizationSlug,
    validationResult.data.clientId,
    validationResult.data.unitId,
    validationResult.data.active,
  );

  if (!result.success) {
    const messages = {
      client_inactive: "Ative o cliente antes de ativar esta unidade.",
      client_not_found: "O cliente não foi encontrado.",
      not_found: "A unidade não foi encontrada.",
      duplicate_name: "Não foi possível alterar o status da unidade.",
      duplicate_tax_id: "Não foi possível alterar o status da unidade.",
      unexpected: "Não foi possível alterar o status da unidade.",
    } as const;

    return { status: "error", message: messages[result.reason] };
  }

  revalidatePath(`/app/${organizationSlug}/cadastros/clientes/${clientId}`);

  return {
    status: "success",
    message: active
      ? "Unidade ativada com sucesso."
      : "Unidade inativada com sucesso.",
  };
}
