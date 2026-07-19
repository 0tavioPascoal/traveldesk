"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { updateServiceType } from "@/features/service-types/application/update-service-type";
import {
  serviceTypeFormSchema,
  serviceTypeIdSchema,
} from "@/features/service-types/schemas/service-type-schema";
import type {
  ServiceTypeActionState,
  ServiceTypeFormValues,
} from "@/features/service-types/types/service-type";

function readValues(formData: FormData): ServiceTypeFormValues {
  const name = formData.get("name");
  const description = formData.get("description");

  return {
    name: typeof name === "string" ? name : "",
    description: typeof description === "string" ? description : "",
    active: formData.get("active") === "on",
  };
}

export async function updateServiceTypeAction(
  organizationSlug: string,
  serviceTypeId: string,
  _previousState: ServiceTypeActionState,
  formData: FormData,
): Promise<ServiceTypeActionState> {
  const values = readValues(formData);
  const [idResult, formResult] = await Promise.all([
    serviceTypeIdSchema.safeParseAsync(serviceTypeId),
    serviceTypeFormSchema.safeParseAsync(values),
  ]);

  if (!idResult.success) {
    return {
      status: "error",
      fieldErrors: {},
      message: "Tipo de atendimento inválido.",
      values,
    };
  }

  if (!formResult.success) {
    const fieldErrors = z.flattenError(formResult.error).fieldErrors;

    return {
      status: "error",
      fieldErrors,
      message: "Revise os campos destacados.",
      values,
    };
  }

  const result = await updateServiceType(
    organizationSlug,
    idResult.data,
    formResult.data,
  );

  if (!result.success) {
    const messages = {
      duplicate_name:
        "Já existe um tipo de atendimento com este nome nesta organização.",
      not_found: "O tipo de atendimento não foi encontrado.",
      unexpected:
        "Não foi possível salvar o tipo de atendimento. Tente novamente.",
    } as const;

    return {
      status: "error",
      fieldErrors: {},
      message: messages[result.reason],
      values,
    };
  }

  const listPath = `/app/${organizationSlug}/cadastros/tipos-atendimento`;
  revalidatePath(listPath);
  redirect(`${listPath}?feedback=updated`);
}
