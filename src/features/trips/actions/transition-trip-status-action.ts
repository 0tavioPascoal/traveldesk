"use server";

import { revalidatePath } from "next/cache";

import { revalidateSchedule } from "@/features/schedule/application/revalidate-schedule";
import { tripExecutionErrorMessage } from "@/features/trips/application/map-trip-execution-error";
import { transitionTripStatus } from "@/features/trips/application/transition-trip-status";
import { tripExecutionTransitionSchema } from "@/features/trips/schemas/trip-execution-schema";
import type { TripExecutionActionState } from "@/features/trips/types/trip-execution";

export async function transitionTripStatusAction(
  organizationSlug: string,
  tripId: string,
  targetStatus: string,
  previous: TripExecutionActionState,
  formData: FormData,
): Promise<TripExecutionActionState> {
  void previous;
  const parsed = tripExecutionTransitionSchema.safeParse({
    tripId,
    targetStatus,
    note: formData.get("note"),
  });
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }
  const result = await transitionTripStatus(
    organizationSlug, parsed.data.tripId, parsed.data.targetStatus, parsed.data.note,
  );
  if (!result.success) return { status: "error", message: tripExecutionErrorMessage(result.reason) };
  const base = `/app/${organizationSlug}/planejamento/viagens`;
  revalidatePath(base);
  revalidatePath(`${base}/${tripId}`);
  revalidateSchedule(organizationSlug);
  return { status: "success", message: "Etapa da viagem registrada com sucesso." };
}
