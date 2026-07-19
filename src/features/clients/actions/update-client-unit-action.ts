"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { updateClientUnit } from "@/features/clients/application/update-client-unit";
import {
  clientUnitFormSchema,
  clientUnitIdSchema,
} from "@/features/clients/schemas/client-unit-schema";
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

export async function updateClientUnitAction(
  organizationSlug: string,
  clientId: string,
  unitId: string,
  _previousState: ClientUnitActionState,
  formData: FormData,
): Promise<ClientUnitActionState> {
  const values = readValues(formData);
  const [idResult, validationResult] = await Promise.all([
    clientUnitIdSchema.safeParseAsync(unitId),
    clientUnitFormSchema.safeParseAsync({ clientId, ...values }),
  ]);

  if (!idResult.success) {
    return {
      status: "error",
      fieldErrors: {},
      message: "Unidade inválida.",
      values,
    };
  }

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

  const result = await updateClientUnit(
    organizationSlug,
    idResult.data,
    validationResult.data,
  );

  if (!result.success) {
    const messages = {
      duplicate_name: "Já existe uma unidade com este nome para o cliente.",
      duplicate_tax_id: "Já existe uma unidade com este CNPJ na organização.",
      client_inactive: "Não foi possível salvar a unidade.",
      client_not_found: "O cliente não foi encontrado.",
      not_found: "A unidade não foi encontrada.",
      unexpected: "Não foi possível salvar a unidade. Tente novamente.",
    } as const;

    return {
      status: "error",
      fieldErrors: {},
      message: messages[result.reason],
      values,
    };
  }

  const detailPath = `/app/${organizationSlug}/cadastros/clientes/${clientId}`;
  revalidatePath(detailPath);
  redirect(`${detailPath}?feedback=unit-updated`);
}
