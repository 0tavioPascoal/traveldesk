"use server";

import { revalidatePath } from "next/cache";

import { unavailabilityErrorMessage } from "@/features/unavailabilities/actions/unavailability-action-message";
import { changeVehicleUnavailabilityStatus } from "@/features/unavailabilities/application/change-vehicle-unavailability-status";
import { unavailabilityStatusSchema } from "@/features/unavailabilities/schemas/unavailability-schema";
import type { UnavailabilityQuickActionState } from "@/features/unavailabilities/types/unavailability";

export async function changeVehicleUnavailabilityStatusAction(
  organizationSlug: string,
  id: string,
  active: boolean,
  previous: UnavailabilityQuickActionState,
  formData: FormData,
): Promise<UnavailabilityQuickActionState> {
  void previous;
  void formData;
  const parsed = unavailabilityStatusSchema.safeParse({ id, active });
  if (!parsed.success) return { status: "error", message: "Indisponibilidade inválida." };
  const result = await changeVehicleUnavailabilityStatus(organizationSlug, parsed.data.id, parsed.data.active);
  if (!result.success) return { status: "error", message: unavailabilityErrorMessage(result.reason) };
  revalidatePath(`/app/${organizationSlug}/planejamento/indisponibilidades`);
  return { status: "success", message: active ? "Indisponibilidade reativada." : "Indisponibilidade inativada." };
}
