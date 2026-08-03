"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { revalidateSchedule } from "@/features/schedule/application/revalidate-schedule";
import { tripTransportMessage } from "@/features/trips/application/map-trip-transport-error";
import { saveTripTransport } from "@/features/trips/application/save-trip-transport";
import { tripTransportSchema } from "@/features/trips/schemas/trip-transport-schema";
import type { TripTransportActionState } from "@/features/trips/types/trip-transport";

export async function saveTripTransportAction(
  organizationSlug: string,
  tripId: string,
  previous: TripTransportActionState,
  formData: FormData,
): Promise<TripTransportActionState> {
  void previous;
  const parsed = await tripTransportSchema.safeParseAsync({
    tripId,
    vehicleId: formData.get("vehicleId"),
    driverTechnicianId: formData.get("driverTechnicianId"),
    notes: formData.get("notes") ?? "",
  });
  if (!parsed.success) {
    return {
      status: "error",
      message: "Revise os dados do transporte.",
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
    };
  }
  const result = await saveTripTransport(organizationSlug, parsed.data);
  if (!result.success) return { status: "error", message: tripTransportMessage(result.reason) };
  const base = `/app/${organizationSlug}/planejamento/viagens`;
  revalidatePath(base);
  revalidatePath(`${base}/${tripId}`);
  revalidateSchedule(organizationSlug);
  return { status: "success", message: "Transporte atualizado com sucesso." };
}
