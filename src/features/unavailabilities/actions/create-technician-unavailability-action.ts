"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { readUnavailabilityValues } from "@/features/unavailabilities/actions/read-unavailability-values";
import { revalidateSchedule } from "@/features/schedule/application/revalidate-schedule";
import { unavailabilityErrorMessage } from "@/features/unavailabilities/actions/unavailability-action-message";
import { createTechnicianUnavailability } from "@/features/unavailabilities/application/create-technician-unavailability";
import { unavailabilityFormSchema } from "@/features/unavailabilities/schemas/unavailability-schema";
import type { UnavailabilityActionState } from "@/features/unavailabilities/types/unavailability";

export async function createTechnicianUnavailabilityAction(
  organizationSlug: string,
  _previous: UnavailabilityActionState,
  formData: FormData,
): Promise<UnavailabilityActionState> {
  const values = readUnavailabilityValues(formData);
  const parsed = unavailabilityFormSchema.safeParse(values);
  if (!parsed.success) return { status: "error", message: "Revise os campos destacados.", fieldErrors: z.flattenError(parsed.error).fieldErrors, values };
  const result = await createTechnicianUnavailability(organizationSlug, parsed.data);
  if (!result.success) return { status: "error", message: unavailabilityErrorMessage(result.reason), fieldErrors: {}, values };
  const path = `/app/${organizationSlug}/planejamento/indisponibilidades`;
  revalidatePath(path);
  revalidateSchedule(organizationSlug);
  redirect(`${path}?resource=technicians&feedback=created`);
}
