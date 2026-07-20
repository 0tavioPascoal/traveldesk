"use server";

import { revalidatePath } from "next/cache";

import { unlinkTechnicianProfile } from "@/features/technicians/application/unlink-technician-profile";
import type { TechnicianProfileActionState } from "@/features/technicians/types/technician";

export async function unlinkTechnicianProfileAction(
  organizationSlug: string,
  technicianId: string,
  _previousState: TechnicianProfileActionState,
  _formData: FormData,
): Promise<TechnicianProfileActionState> {
  void _previousState;
  void _formData;
  const result = await unlinkTechnicianProfile(organizationSlug, technicianId);
  if (!result.success) return { status: "error", message: "Não foi possível desvincular o usuário." };
  revalidatePath(`/app/${organizationSlug}/cadastros/tecnicos/${technicianId}`);
  return { status: "success", message: "Usuário desvinculado com sucesso." };
}
