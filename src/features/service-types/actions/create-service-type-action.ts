"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createServiceType } from "@/features/service-types/application/create-service-type";
import { serviceTypeFormSchema } from "@/features/service-types/schemas/service-type-schema";
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

export async function createServiceTypeAction(
  organizationSlug: string,
  _previousState: ServiceTypeActionState,
  formData: FormData,
): Promise<ServiceTypeActionState> {
  const values = readValues(formData);
  const validationResult = serviceTypeFormSchema.safeParse(values);

  if (!validationResult.success) {
    const fieldErrors = z.flattenError(validationResult.error).fieldErrors;

    return {
      status: "error",
      fieldErrors,
      message: "Revise os campos destacados.",
      values,
    };
  }

  const result = await createServiceType(
    organizationSlug,
    validationResult.data,
  );

  if (!result.success) {
    return {
      status: "error",
      fieldErrors: {},
      message:
        result.reason === "duplicate_name"
          ? "Já existe um tipo de atendimento com este nome nesta organização."
          : "Não foi possível cadastrar o tipo de atendimento. Tente novamente.",
      values,
    };
  }

  const listPath = `/app/${organizationSlug}/cadastros/tipos-atendimento`;
  revalidatePath(listPath);
  redirect(`${listPath}?feedback=created`);
}
