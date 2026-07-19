"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { updateClient } from "@/features/clients/application/update-client";
import {
  clientFormSchema,
  clientIdSchema,
} from "@/features/clients/schemas/client-schema";
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

export async function updateClientAction(
  organizationSlug: string,
  clientId: string,
  _previousState: ClientActionState,
  formData: FormData,
): Promise<ClientActionState> {
  const values = readValues(formData);
  const [idResult, formResult] = await Promise.all([
    clientIdSchema.safeParseAsync(clientId),
    clientFormSchema.safeParseAsync(values),
  ]);

  if (!idResult.success) {
    return {
      status: "error",
      fieldErrors: {},
      message: "Cliente inválido.",
      values,
    };
  }

  if (!formResult.success) {
    return {
      status: "error",
      fieldErrors: z.flattenError(formResult.error).fieldErrors,
      message: "Revise os campos destacados.",
      values,
    };
  }

  const result = await updateClient(
    organizationSlug,
    idResult.data,
    formResult.data,
  );

  if (!result.success) {
    const messages = {
      duplicate_legal_name:
        "Já existe um cliente com esta razão social na organização.",
      duplicate_tax_id: "Já existe um cliente com este CNPJ na organização.",
      active_units_exist: "Não foi possível salvar o cliente.",
      not_found: "O cliente não foi encontrado.",
      unexpected: "Não foi possível salvar o cliente. Tente novamente.",
    } as const;

    return {
      status: "error",
      fieldErrors: {},
      message: messages[result.reason],
      values,
    };
  }

  const listPath = `/app/${organizationSlug}/cadastros/clientes`;
  const detailPath = `${listPath}/${result.clientId}`;
  revalidatePath(listPath);
  revalidatePath(detailPath);
  redirect(`${detailPath}?feedback=updated`);
}
