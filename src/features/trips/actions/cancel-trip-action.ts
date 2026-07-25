"use server";

import { revalidatePath } from "next/cache";

import { tripActionMessage } from "@/features/trips/actions/trip-action-message";
import { cancelTrip } from "@/features/trips/application/cancel-trip";
import { cancelTripSchema } from "@/features/trips/schemas/trip-transition-schema";
import type { TripQuickActionState } from "@/features/trips/types/trip";

export async function cancelTripAction(organizationSlug: string, tripId: string, previous: TripQuickActionState, formData: FormData): Promise<TripQuickActionState> {
  void previous;
  const parsed = cancelTripSchema.safeParse({ tripId, cancellationReason: formData.get("cancellationReason") });
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0]?.message ?? "Informe o motivo do cancelamento." };
  const result = await cancelTrip(organizationSlug, parsed.data.tripId, parsed.data.cancellationReason);
  if (!result.success) return { status: "error", message: tripActionMessage(result.reason) };
  const base = `/app/${organizationSlug}/planejamento/viagens`;
  revalidatePath(base); revalidatePath(`${base}/${tripId}`);
  return { status: "success", message: "Viagem cancelada." };
}
