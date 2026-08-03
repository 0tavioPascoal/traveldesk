"use server";

import { revalidatePath } from "next/cache";

import { revalidateSchedule } from "@/features/schedule/application/revalidate-schedule";
import { tripTransportMessage } from "@/features/trips/application/map-trip-transport-error";
import { removeTripTransport } from "@/features/trips/application/remove-trip-transport";
import { removeTripTransportSchema } from "@/features/trips/schemas/trip-transport-schema";
import type { TripTransportActionState } from "@/features/trips/types/trip-transport";

export async function removeTripTransportAction(
  organizationSlug: string,
  tripId: string,
  previous: TripTransportActionState,
  formData: FormData,
): Promise<TripTransportActionState> {
  void previous;
  void formData;
  const parsed = await removeTripTransportSchema.safeParseAsync({ tripId });
  if (!parsed.success) return { status: "error", message: "Viagem inválida." };
  const result = await removeTripTransport(organizationSlug, parsed.data.tripId);
  if (!result.success) return { status: "error", message: tripTransportMessage(result.reason) };
  const base = `/app/${organizationSlug}/planejamento/viagens`;
  revalidatePath(base);
  revalidatePath(`${base}/${tripId}`);
  revalidateSchedule(organizationSlug);
  return { status: "success", message: "Reserva de transporte removida." };
}
