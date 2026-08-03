"use server";

import { revalidatePath } from "next/cache";

import { revalidateSchedule } from "@/features/schedule/application/revalidate-schedule";
import { tripActionMessage } from "@/features/trips/actions/trip-action-message";
import { returnTripToDraft } from "@/features/trips/application/return-trip-to-draft";
import { tripTransitionSchema } from "@/features/trips/schemas/trip-transition-schema";
import type { TripQuickActionState } from "@/features/trips/types/trip";

export async function returnTripToDraftAction(organizationSlug: string, tripId: string, previous: TripQuickActionState, formData: FormData): Promise<TripQuickActionState> {
  void previous; void formData;
  const parsed = tripTransitionSchema.safeParse({ tripId });
  if (!parsed.success) return { status: "error", message: "Viagem inválida." };
  const result = await returnTripToDraft(organizationSlug, parsed.data.tripId);
  if (!result.success) return { status: "error", message: tripActionMessage(result.reason) };
  const base = `/app/${organizationSlug}/planejamento/viagens`;
  revalidatePath(base); revalidatePath(`${base}/${tripId}`);
  revalidateSchedule(organizationSlug);
  return { status: "success", message: "Viagem retornada para rascunho." };
}
