"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { revalidateSchedule } from "@/features/schedule/application/revalidate-schedule";
import { adjustTripOvernightCalculation } from "@/features/trips/application/adjust-trip-overnight-calculation";
import { ensureTripOvernightCalculation } from "@/features/trips/application/ensure-trip-overnight-calculation";
import { tripOvernightMessage } from "@/features/trips/application/map-trip-overnight-error";
import { resetTripOvernightAdjustment } from "@/features/trips/application/reset-trip-overnight-adjustment";
import { reviewTripOvernightCalculation } from "@/features/trips/application/review-trip-overnight-calculation";
import {
  tripOvernightAdjustmentSchema,
  tripOvernightResetSchema,
  tripOvernightReviewSchema,
} from "@/features/trips/schemas/trip-overnight-schema";
import type { TripOvernightActionState } from "@/features/trips/types/trip-overnight";

function revalidateTrip(organizationSlug: string, tripId: string) {
  revalidatePath(`/app/${organizationSlug}/planejamento/viagens/${tripId}`);
  revalidateSchedule(organizationSlug);
}

export async function reviewTripOvernightAction(
  organizationSlug: string,
  tripId: string,
  expectedRevision: number,
  previous: TripOvernightActionState,
  formData: FormData,
): Promise<TripOvernightActionState> {
  void previous;
  void formData;
  const parsed = tripOvernightReviewSchema.safeParse({ tripId, expectedRevision });
  if (!parsed.success) return { status: "error", message: "O cálculo informado não é válido." };
  const result = await reviewTripOvernightCalculation(organizationSlug, parsed.data.tripId, parsed.data.expectedRevision);
  if (!result.success) return { status: "error", message: tripOvernightMessage(result.reason) };
  revalidateTrip(organizationSlug, tripId);
  return { status: "success", message: "Cálculo revisado com sucesso." };
}

export async function adjustTripOvernightAction(
  organizationSlug: string,
  tripId: string,
  expectedRevision: number,
  previous: TripOvernightActionState,
  formData: FormData,
): Promise<TripOvernightActionState> {
  void previous;
  const values = {
    adjustedOvernights: String(formData.get("adjustedOvernights") ?? ""),
    adjustmentReason: String(formData.get("adjustmentReason") ?? ""),
  };
  const parsed = tripOvernightAdjustmentSchema.safeParse({ tripId, expectedRevision, ...values });
  if (!parsed.success) {
    return {
      status: "error",
      message: "Revise os dados do ajuste.",
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
      values,
    };
  }
  const result = await adjustTripOvernightCalculation(organizationSlug, parsed.data);
  if (!result.success) return { status: "error", message: tripOvernightMessage(result.reason), values };
  revalidateTrip(organizationSlug, tripId);
  return { status: "success", message: "Pernoites ajustados com sucesso." };
}

export async function resetTripOvernightAction(
  organizationSlug: string,
  tripId: string,
  expectedRevision: number,
  previous: TripOvernightActionState,
  formData: FormData,
): Promise<TripOvernightActionState> {
  void previous;
  void formData;
  const parsed = tripOvernightResetSchema.safeParse({ tripId, expectedRevision });
  if (!parsed.success) return { status: "error", message: "O cálculo informado não é válido." };
  const result = await resetTripOvernightAdjustment(organizationSlug, parsed.data.tripId, parsed.data.expectedRevision);
  if (!result.success) return { status: "error", message: tripOvernightMessage(result.reason) };
  revalidateTrip(organizationSlug, tripId);
  return { status: "success", message: "O cálculo automático voltou a ser utilizado." };
}

export async function ensureTripOvernightAction(
  organizationSlug: string,
  tripId: string,
  previous: TripOvernightActionState,
  formData: FormData,
): Promise<TripOvernightActionState> {
  void previous;
  void formData;
  const result = await ensureTripOvernightCalculation(organizationSlug, tripId);
  if (!result.success) return { status: "error", message: tripOvernightMessage(result.reason) };
  revalidateTrip(organizationSlug, tripId);
  return { status: "success", message: "Cálculo atualizado. Revise novamente os pernoites." };
}
