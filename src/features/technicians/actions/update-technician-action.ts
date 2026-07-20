"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { readTechnicianFormValues } from "@/features/technicians/actions/read-technician-form-values";
import { updateTechnician } from "@/features/technicians/application/update-technician";
import { technicianFormSchema } from "@/features/technicians/schemas/technician-schema";
import type { TechnicianActionState } from "@/features/technicians/types/technician";

export async function updateTechnicianAction(
  organizationSlug: string,
  technicianId: string,
  _previousState: TechnicianActionState,
  formData: FormData,
): Promise<TechnicianActionState> {
  const values = readTechnicianFormValues(formData);
  const validation = technicianFormSchema.safeParse(values);
  if (!validation.success) return { status: "error", fieldErrors: z.flattenError(validation.error).fieldErrors, message: "Revise os campos destacados.", values };
  const result = await updateTechnician(organizationSlug, technicianId, validation.data);
  if (!result.success) {
    const messages = {
      duplicate_document: "Já existe um técnico com este CPF na organização.",
      duplicate_email: "Já existe um técnico com este e-mail na organização.",
      invalid_skills: "Revise as especialidades selecionadas.",
      not_found: "O técnico não foi encontrado.",
      profile_not_eligible: "O usuário vinculado não é mais elegível.",
      unexpected: "Não foi possível atualizar o técnico. Tente novamente.",
    } as const;
    return { status: "error", fieldErrors: {}, message: messages[result.reason], values };
  }
  const detailPath = `/app/${organizationSlug}/cadastros/tecnicos/${technicianId}`;
  revalidatePath(`/app/${organizationSlug}/cadastros/tecnicos`);
  revalidatePath(detailPath);
  redirect(`${detailPath}?feedback=updated`);
}
