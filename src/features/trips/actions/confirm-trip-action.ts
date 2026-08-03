"use server";

import { revalidatePath } from "next/cache";

import { revalidateSchedule } from "@/features/schedule/application/revalidate-schedule";
import { confirmTrip } from "@/features/trips/application/confirm-trip";
import { tripConfirmationMessage } from "@/features/trips/application/map-trip-confirmation-error";
import { tripConfirmationSchema } from "@/features/trips/schemas/trip-confirmation-schema";
import type { TripConfirmationActionState } from "@/features/trips/types/trip-confirmation";

export async function confirmTripAction(
  organizationSlug: string,
  tripId: string,
  previous: TripConfirmationActionState,
  formData: FormData,
): Promise<TripConfirmationActionState> {
  void previous;
  void formData;
  const parsed = tripConfirmationSchema.safeParse({ tripId });
  if (!parsed.success) return { status: "error", message: "Viagem inválida." };
  const result = await confirmTrip(organizationSlug, parsed.data.tripId);
  if (!result.success) return { status: "error", message: tripConfirmationMessage(result.reason) };
  const base = `/app/${organizationSlug}/planejamento/viagens`;
  revalidatePath(base);
  revalidatePath(`${base}/${tripId}`);
  revalidateSchedule(organizationSlug);
  return { status: "success", message: "Viagem confirmada com sucesso." };
}
