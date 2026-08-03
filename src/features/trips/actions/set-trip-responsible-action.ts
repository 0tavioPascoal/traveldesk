"use server";

import { revalidatePath } from "next/cache";

import { revalidateSchedule } from "@/features/schedule/application/revalidate-schedule";
import { tripStaffingMessage } from "@/features/trips/application/map-trip-staffing-error";
import { setResponsibleTechnician } from "@/features/trips/application/set-responsible-technician";
import { tripResponsibleSchema } from "@/features/trips/schemas/trip-technicians-schema";
import type { TripStaffingActionState } from "@/features/trips/types/trip-staffing";

export async function setTripResponsibleAction(
  organizationSlug: string,
  tripId: string,
  previous: TripStaffingActionState,
  formData: FormData,
): Promise<TripStaffingActionState> {
  void previous;
  const parsed = await tripResponsibleSchema.safeParseAsync({ tripId, technicianId: formData.get("technicianId") });
  if (!parsed.success) return { status: "error", message: "Selecione um responsável válido." };
  const result = await setResponsibleTechnician(organizationSlug, parsed.data.tripId, parsed.data.technicianId);
  if (!result.success) return { status: "error", message: tripStaffingMessage(result.reason) };
  revalidatePath(`/app/${organizationSlug}/planejamento/viagens/${tripId}`);
  revalidateSchedule(organizationSlug);
  return { status: "success", message: "Responsável atualizado." };
}
