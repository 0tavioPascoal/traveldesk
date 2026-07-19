"use server";

import { revalidatePath } from "next/cache";

import { changeClientStatus } from "@/features/clients/application/change-client-status";
import { clientStatusSchema } from "@/features/clients/schemas/client-schema";
import type { ClientStatusActionState } from "@/features/clients/types/client";

export async function changeClientStatusAction(
  organizationSlug: string,
  clientId: string,
  active: boolean,
  _previousState: ClientStatusActionState,
  _formData: FormData,
): Promise<ClientStatusActionState> {
  void _previousState;
  void _formData;

  const validationResult = clientStatusSchema.safeParse({
    id: clientId,
    active,
  });

  if (!validationResult.success) {
    return { status: "error", message: "Não foi possível identificar o cliente." };
  }

  const result = await changeClientStatus(
    organizationSlug,
    validationResult.data.id,
    validationResult.data.active,
  );

  if (!result.success) {
    const messages = {
      active_units_exist:
        "Inative todas as unidades antes de inativar o cliente.",
      not_found: "O cliente não foi encontrado.",
      duplicate_legal_name: "Não foi possível alterar o status do cliente.",
      duplicate_tax_id: "Não foi possível alterar o status do cliente.",
      unexpected: "Não foi possível alterar o status do cliente.",
    } as const;

    return {
      status: "error",
      message: messages[result.reason],
    };
  }

  const listPath = `/app/${organizationSlug}/cadastros/clientes`;
  revalidatePath(listPath);
  revalidatePath(`${listPath}/${result.clientId}`);

  return {
    status: "success",
    message: active
      ? "Cliente ativado com sucesso."
      : "Cliente inativado com sucesso.",
  };
}
