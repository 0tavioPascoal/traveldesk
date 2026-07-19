"use server";

import { revalidatePath } from "next/cache";

import { changeServiceTypeStatus } from "@/features/service-types/application/change-service-type-status";
import { serviceTypeStatusSchema } from "@/features/service-types/schemas/service-type-schema";
import type { ServiceTypeStatusActionState } from "@/features/service-types/types/service-type";

export async function changeServiceTypeStatusAction(
  organizationSlug: string,
  serviceTypeId: string,
  active: boolean,
  _previousState: ServiceTypeStatusActionState,
  _formData: FormData,
): Promise<ServiceTypeStatusActionState> {
  void _previousState;
  void _formData;

  const validationResult = serviceTypeStatusSchema.safeParse({
    id: serviceTypeId,
    active,
  });

  if (!validationResult.success) {
    return {
      status: "error",
      message: "Não foi possível identificar o tipo de atendimento.",
    };
  }

  const result = await changeServiceTypeStatus(
    organizationSlug,
    validationResult.data.id,
    validationResult.data.active,
  );

  if (!result.success) {
    return {
      status: "error",
      message:
        result.reason === "not_found"
          ? "O tipo de atendimento não foi encontrado."
          : "Não foi possível alterar o status do tipo de atendimento.",
    };
  }

  revalidatePath(`/app/${organizationSlug}/cadastros/tipos-atendimento`);

  return {
    status: "success",
    message: active
      ? "Tipo de atendimento ativado com sucesso."
      : "Tipo de atendimento inativado com sucesso.",
  };
}
