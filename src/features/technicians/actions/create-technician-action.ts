"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { revalidateSchedule } from "@/features/schedule/application/revalidate-schedule";
import { createTechnician } from "@/features/technicians/application/create-technician";
import { readTechnicianFormValues } from "@/features/technicians/actions/read-technician-form-values";
import { technicianFormSchema } from "@/features/technicians/schemas/technician-schema";
import type { TechnicianActionState } from "@/features/technicians/types/technician";

const errorMessages = {
  duplicate_document: "Já existe um técnico com este CPF na organização.",
  duplicate_email: "Já existe um técnico com este e-mail na organização.",
  invalid_skills: "Revise as especialidades selecionadas.",
  not_found: "O técnico não foi encontrado.",
  profile_not_eligible: "O usuário não está disponível para vínculo.",
  unexpected: "Não foi possível salvar o técnico. Tente novamente.",
} as const;

export async function createTechnicianAction(
  organizationSlug: string,
  _previousState: TechnicianActionState,
  formData: FormData,
): Promise<TechnicianActionState> {
  const values = readTechnicianFormValues(formData);
  const validation = technicianFormSchema.safeParse(values);
  if (!validation.success) return {
    status: "error",
    fieldErrors: z.flattenError(validation.error).fieldErrors,
    message: "Revise os campos destacados.",
    values,
  };
  const result = await createTechnician(organizationSlug, validation.data);
  if (!result.success) return { status: "error", fieldErrors: {}, message: errorMessages[result.reason], values };
  const listPath = `/app/${organizationSlug}/cadastros/tecnicos`;
  revalidatePath(listPath);
  revalidateSchedule(organizationSlug);
  redirect(`${listPath}/${result.technicianId}?feedback=created`);
}
