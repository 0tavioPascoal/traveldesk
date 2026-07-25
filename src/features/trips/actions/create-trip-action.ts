"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { readTripFormValues } from "@/features/trips/actions/read-trip-form-values";
import { tripActionMessage } from "@/features/trips/actions/trip-action-message";
import { createTrip } from "@/features/trips/application/create-trip";
import { tripFormSchema, tripSubmissionIntentSchema } from "@/features/trips/schemas/trip-schema";
import type { TripActionState } from "@/features/trips/types/trip";

export async function createTripAction(organizationSlug: string, previous: TripActionState, formData: FormData): Promise<TripActionState> {
  void previous;
  const values = readTripFormValues(formData);
  const [parsed, intent] = await Promise.all([
    tripFormSchema.safeParseAsync(values), tripSubmissionIntentSchema.safeParseAsync(formData.get("intent")),
  ]);
  if (!parsed.success) return { status: "error", message: "Revise os campos destacados.", fieldErrors: z.flattenError(parsed.error).fieldErrors, values };
  if (!intent.success) return { status: "error", message: "Ação de salvamento inválida.", fieldErrors: {}, values };
  const result = await createTrip(organizationSlug, parsed.data, intent.data === "planned");
  if (!result.success) return { status: "error", message: tripActionMessage(result.reason), fieldErrors: {}, values };
  const listPath = `/app/${organizationSlug}/planejamento/viagens`;
  revalidatePath(listPath);
  redirect(`${listPath}/${result.tripId}?feedback=created`);
}
