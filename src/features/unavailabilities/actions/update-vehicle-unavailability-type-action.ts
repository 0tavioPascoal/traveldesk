"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { readUnavailabilityTypeValues } from "@/features/unavailabilities/actions/read-unavailability-values";
import { updateVehicleUnavailabilityType } from "@/features/unavailabilities/application/update-vehicle-unavailability-type";
import { unavailabilityTypeFormSchema, unavailabilityTypeIdSchema } from "@/features/unavailabilities/schemas/unavailability-type-schema";
import type { UnavailabilityTypeActionState } from "@/features/unavailabilities/types/unavailability";

export async function updateVehicleUnavailabilityTypeAction(
  organizationSlug: string,
  id: string,
  _previous: UnavailabilityTypeActionState,
  formData: FormData,
): Promise<UnavailabilityTypeActionState> {
  const values = readUnavailabilityTypeValues(formData);
  const [idResult, parsed] = await Promise.all([unavailabilityTypeIdSchema.safeParseAsync(id), unavailabilityTypeFormSchema.safeParseAsync(values)]);
  if (!idResult.success) return { status: "error", message: "Tipo inválido.", fieldErrors: {}, values };
  if (!parsed.success) return { status: "error", message: "Revise os campos destacados.", fieldErrors: z.flattenError(parsed.error).fieldErrors, values };
  const result = await updateVehicleUnavailabilityType(organizationSlug, idResult.data, parsed.data);
  if (!result.success) return { status: "error", message: result.reason === "duplicate_name" ? "Já existe um tipo com este nome." : result.reason === "not_found" ? "Tipo não encontrado." : "Não foi possível atualizar o tipo.", fieldErrors: {}, values };
  const path = `/app/${organizationSlug}/cadastros/tipos-indisponibilidade/veiculos`;
  revalidatePath(path);
  redirect(`${path}?feedback=updated`);
}
