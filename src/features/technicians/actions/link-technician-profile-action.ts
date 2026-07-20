"use server";

import { revalidatePath } from "next/cache";

import { linkTechnicianProfile } from "@/features/technicians/application/link-technician-profile";
import { technicianProfileSchema } from "@/features/technicians/schemas/technician-profile-schema";
import type { TechnicianProfileActionState } from "@/features/technicians/types/technician";

export async function linkTechnicianProfileAction(
  organizationSlug: string,
  technicianId: string,
  _previousState: TechnicianProfileActionState,
  formData: FormData,
): Promise<TechnicianProfileActionState> {
  const validation = technicianProfileSchema.safeParse({ profileId: formData.get("profileId") });
  if (!validation.success) return { status: "error", message: "Selecione um usuário válido." };
  const result = await linkTechnicianProfile(organizationSlug, technicianId, validation.data.profileId);
  if (!result.success) return { status: "error", message: result.reason === "profile_not_eligible" ? "Este usuário não está disponível para vínculo." : "Não foi possível vincular o usuário." };
  revalidatePath(`/app/${organizationSlug}/cadastros/tecnicos/${technicianId}`);
  return { status: "success", message: "Usuário vinculado com sucesso." };
}
