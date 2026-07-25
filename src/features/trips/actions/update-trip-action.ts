"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { readTripFormValues } from "@/features/trips/actions/read-trip-form-values";
import { tripActionMessage } from "@/features/trips/actions/trip-action-message";
import { updateTrip } from "@/features/trips/application/update-trip";
import { tripFormSchema, tripIdSchema, tripSubmissionIntentSchema } from "@/features/trips/schemas/trip-schema";
import type { TripActionState } from "@/features/trips/types/trip";

export async function updateTripAction(organizationSlug: string, tripId: string, previous: TripActionState, formData: FormData): Promise<TripActionState> {
  void previous;
  const values = readTripFormValues(formData);
  const [id, parsed, intent] = await Promise.all([
    tripIdSchema.safeParseAsync(tripId), tripFormSchema.safeParseAsync(values),
    tripSubmissionIntentSchema.safeParseAsync(formData.get("intent")),
  ]);
  if (!id.success) return { status: "error", message: "Viagem inválida.", fieldErrors: {}, values };
  if (!parsed.success) return { status: "error", message: "Revise os campos destacados.", fieldErrors: z.flattenError(parsed.error).fieldErrors, values };
  if (!intent.success) return { status: "error", message: "Ação de salvamento inválida.", fieldErrors: {}, values };
  const result = await updateTrip(organizationSlug, id.data, parsed.data, intent.data === "planned");
  if (!result.success) return { status: "error", message: tripActionMessage(result.reason), fieldErrors: {}, values };
  const listPath = `/app/${organizationSlug}/planejamento/viagens`;
  revalidatePath(listPath);
  revalidatePath(`${listPath}/${result.tripId}`);
  redirect(`${listPath}/${result.tripId}?feedback=updated`);
}
