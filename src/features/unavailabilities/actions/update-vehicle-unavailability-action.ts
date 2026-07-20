"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { readUnavailabilityValues } from "@/features/unavailabilities/actions/read-unavailability-values";
import { unavailabilityErrorMessage } from "@/features/unavailabilities/actions/unavailability-action-message";
import { updateVehicleUnavailability } from "@/features/unavailabilities/application/update-vehicle-unavailability";
import { unavailabilityFormSchema, unavailabilityIdSchema } from "@/features/unavailabilities/schemas/unavailability-schema";
import type { UnavailabilityActionState } from "@/features/unavailabilities/types/unavailability";

export async function updateVehicleUnavailabilityAction(
  organizationSlug: string,
  id: string,
  _previous: UnavailabilityActionState,
  formData: FormData,
): Promise<UnavailabilityActionState> {
  const values = readUnavailabilityValues(formData);
  const [idResult, parsed] = await Promise.all([unavailabilityIdSchema.safeParseAsync(id), unavailabilityFormSchema.safeParseAsync(values)]);
  if (!idResult.success) return { status: "error", message: "Indisponibilidade inválida.", fieldErrors: {}, values };
  if (!parsed.success) return { status: "error", message: "Revise os campos destacados.", fieldErrors: z.flattenError(parsed.error).fieldErrors, values };
  const result = await updateVehicleUnavailability(organizationSlug, idResult.data, parsed.data);
  if (!result.success) return { status: "error", message: unavailabilityErrorMessage(result.reason), fieldErrors: {}, values };
  const path = `/app/${organizationSlug}/planejamento/indisponibilidades`;
  revalidatePath(path);
  redirect(`${path}?resource=vehicles&feedback=updated`);
}
