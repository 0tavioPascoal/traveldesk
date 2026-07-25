"use server";

import { revalidatePath } from "next/cache";

import { tripActionMessage } from "@/features/trips/actions/trip-action-message";
import { restoreCanceledTrip } from "@/features/trips/application/restore-canceled-trip";
import { tripTransitionSchema } from "@/features/trips/schemas/trip-transition-schema";
import type { TripQuickActionState } from "@/features/trips/types/trip";

export async function restoreCanceledTripAction(organizationSlug: string, tripId: string, previous: TripQuickActionState, formData: FormData): Promise<TripQuickActionState> {
  void previous; void formData;
  const parsed = tripTransitionSchema.safeParse({ tripId });
  if (!parsed.success) return { status: "error", message: "Viagem inválida." };
  const result = await restoreCanceledTrip(organizationSlug, parsed.data.tripId);
  if (!result.success) return { status: "error", message: tripActionMessage(result.reason) };
  const base = `/app/${organizationSlug}/planejamento/viagens`;
  revalidatePath(base); revalidatePath(`${base}/${tripId}`);
  return { status: "success", message: "Viagem restaurada como rascunho." };
}
