"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createClient } from "@/features/clients/application/create-client";
import { clientFormSchema } from "@/features/clients/schemas/client-schema";
import type {
  ClientActionState,
  ClientFormValues,
} from "@/features/clients/types/client";

function readValues(formData: FormData): ClientFormValues {
  const value = (name: keyof ClientFormValues) => {
    const field = formData.get(name);
    return typeof field === "string" ? field : "";
  };

  return {
    legalName: value("legalName"),
    tradeName: value("tradeName"),
    taxId: value("taxId"),
    segment: value("segment"),
    notes: value("notes"),
  };
}

export async function createClientAction(
  organizationSlug: string,
  _previousState: ClientActionState,
  formData: FormData,
): Promise<ClientActionState> {
  const values = readValues(formData);
  const validationResult = clientFormSchema.safeParse(values);

  if (!validationResult.success) {
    return {
      status: "error",
      fieldErrors: z.flattenError(validationResult.error).fieldErrors,
      message: "Revise os campos destacados.",
      values,
    };
  }

  const result = await createClient(organizationSlug, validationResult.data);

  if (!result.success) {
    const messages = {
      duplicate_legal_name:
        "Já existe um cliente com esta razão social na organização.",
      duplicate_tax_id: "Já existe um cliente com este CNPJ na organização.",
      active_units_exist: "Não foi possível cadastrar o cliente.",
      not_found: "Não foi possível cadastrar o cliente.",
      unexpected: "Não foi possível cadastrar o cliente. Tente novamente.",
    } as const;

    return {
      status: "error",
      fieldErrors: {},
      message: messages[result.reason],
      values,
    };
  }

  const listPath = `/app/${organizationSlug}/cadastros/clientes`;
  revalidatePath(listPath);
  redirect(`${listPath}/${result.clientId}?feedback=created`);
}
