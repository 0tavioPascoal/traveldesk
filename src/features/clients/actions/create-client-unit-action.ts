"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createClientUnit } from "@/features/clients/application/create-client-unit";
import { clientUnitFormSchema } from "@/features/clients/schemas/client-unit-schema";
import type {
  ClientUnitActionState,
  ClientUnitFieldErrors,
  ClientUnitFormValues,
} from "@/features/clients/types/client";

function readValues(formData: FormData): ClientUnitFormValues {
  const value = (name: keyof ClientUnitFormValues) => {
    const field = formData.get(name);
    return typeof field === "string" ? field : "";
  };

  return {
    name: value("name"),
    taxId: value("taxId"),
    addressLine: value("addressLine"),
    addressNumber: value("addressNumber"),
    addressComplement: value("addressComplement"),
    district: value("district"),
    city: value("city"),
    state: value("state"),
    postalCode: value("postalCode"),
    contactName: value("contactName"),
    contactEmail: value("contactEmail"),
    contactPhone: value("contactPhone"),
    accessInstructions: value("accessInstructions"),
    notes: value("notes"),
  };
}

function unitFieldErrors(
  errors: Record<string, string[] | undefined>,
): ClientUnitFieldErrors {
  return {
    name: errors.name,
    taxId: errors.taxId,
    addressLine: errors.addressLine,
    addressNumber: errors.addressNumber,
    addressComplement: errors.addressComplement,
    district: errors.district,
    city: errors.city,
    state: errors.state,
    postalCode: errors.postalCode,
    contactName: errors.contactName,
    contactEmail: errors.contactEmail,
    contactPhone: errors.contactPhone,
    accessInstructions: errors.accessInstructions,
    notes: errors.notes,
  };
}

export async function createClientUnitAction(
  organizationSlug: string,
  clientId: string,
  _previousState: ClientUnitActionState,
  formData: FormData,
): Promise<ClientUnitActionState> {
  const values = readValues(formData);
  const validationResult = clientUnitFormSchema.safeParse({
    clientId,
    ...values,
  });

  if (!validationResult.success) {
    return {
      status: "error",
      fieldErrors: unitFieldErrors(
        z.flattenError(validationResult.error).fieldErrors,
      ),
      message: "Revise os campos destacados.",
      values,
    };
  }

  const result = await createClientUnit(
    organizationSlug,
    validationResult.data,
  );

  if (!result.success) {
    const messages = {
      duplicate_name: "Já existe uma unidade com este nome para o cliente.",
      duplicate_tax_id: "Já existe uma unidade com este CNPJ na organização.",
      client_inactive: "Não é possível cadastrar unidade em cliente inativo.",
      client_not_found: "O cliente não foi encontrado.",
      not_found: "Não foi possível cadastrar a unidade.",
      unexpected: "Não foi possível cadastrar a unidade. Tente novamente.",
    } as const;

    return {
      status: "error",
      fieldErrors: {},
      message: messages[result.reason],
      values,
    };
  }

  const listPath = `/app/${organizationSlug}/cadastros/clientes`;
  const detailPath = `${listPath}/${clientId}`;
  revalidatePath(listPath);
  revalidatePath(detailPath);
  redirect(`${detailPath}?feedback=unit-created`);
}
