"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { readUnavailabilityTypeValues } from "@/features/unavailabilities/actions/read-unavailability-values";
import { createVehicleUnavailabilityType } from "@/features/unavailabilities/application/create-vehicle-unavailability-type";
import { unavailabilityTypeFormSchema } from "@/features/unavailabilities/schemas/unavailability-type-schema";
import type { UnavailabilityTypeActionState } from "@/features/unavailabilities/types/unavailability";

export async function createVehicleUnavailabilityTypeAction(
  organizationSlug: string,
  _previous: UnavailabilityTypeActionState,
  formData: FormData,
): Promise<UnavailabilityTypeActionState> {
  const values = readUnavailabilityTypeValues(formData);
  const parsed = unavailabilityTypeFormSchema.safeParse(values);
  if (!parsed.success) return { status: "error", message: "Revise os campos destacados.", fieldErrors: z.flattenError(parsed.error).fieldErrors, values };
  const result = await createVehicleUnavailabilityType(organizationSlug, parsed.data);
  if (!result.success) return { status: "error", message: result.reason === "duplicate_name" ? "Já existe um tipo com este nome." : "Não foi possível cadastrar o tipo.", fieldErrors: {}, values };
  const path = `/app/${organizationSlug}/cadastros/tipos-indisponibilidade/veiculos`;
  revalidatePath(path);
  redirect(`${path}?feedback=created`);
}
