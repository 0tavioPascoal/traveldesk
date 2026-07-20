"use server";

import { revalidatePath } from "next/cache";

import { changeTechnicianUnavailabilityTypeStatus } from "@/features/unavailabilities/application/change-technician-unavailability-type-status";
import { unavailabilityTypeStatusSchema } from "@/features/unavailabilities/schemas/unavailability-type-schema";
import type { UnavailabilityQuickActionState } from "@/features/unavailabilities/types/unavailability";

export async function changeTechnicianUnavailabilityTypeStatusAction(
  organizationSlug: string,
  id: string,
  active: boolean,
  previous: UnavailabilityQuickActionState,
  formData: FormData,
): Promise<UnavailabilityQuickActionState> {
  void previous;
  void formData;
  const parsed = unavailabilityTypeStatusSchema.safeParse({ id, active });
  if (!parsed.success) return { status: "error", message: "Tipo inválido." };
  const result = await changeTechnicianUnavailabilityTypeStatus(organizationSlug, parsed.data.id, parsed.data.active);
  if (!result.success) return { status: "error", message: result.reason === "not_found" ? "Tipo não encontrado." : "Não foi possível alterar o status." };
  revalidatePath(`/app/${organizationSlug}/cadastros/tipos-indisponibilidade/tecnicos`);
  return { status: "success", message: active ? "Tipo ativado." : "Tipo inativado." };
}
