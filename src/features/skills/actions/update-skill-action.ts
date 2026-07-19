"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { updateSkill } from "@/features/skills/application/update-skill";
import {
  skillFormSchema,
  skillIdSchema,
} from "@/features/skills/schemas/skill-schema";
import type {
  SkillActionState,
  SkillFormValues,
} from "@/features/skills/types/skill";

function readValues(formData: FormData): SkillFormValues {
  const name = formData.get("name");
  const description = formData.get("description");

  return {
    name: typeof name === "string" ? name : "",
    description: typeof description === "string" ? description : "",
    active: formData.get("active") === "on",
  };
}

export async function updateSkillAction(
  organizationSlug: string,
  skillId: string,
  _previousState: SkillActionState,
  formData: FormData,
): Promise<SkillActionState> {
  const values = readValues(formData);
  const [idResult, formResult] = await Promise.all([
    skillIdSchema.safeParseAsync(skillId),
    skillFormSchema.safeParseAsync(values),
  ]);

  if (!idResult.success) {
    return {
      status: "error",
      fieldErrors: {},
      message: "Especialidade inválida.",
      values,
    };
  }

  if (!formResult.success) {
    const fieldErrors = z.flattenError(formResult.error).fieldErrors;

    return {
      status: "error",
      fieldErrors,
      message: "Revise os campos destacados.",
      values,
    };
  }

  const result = await updateSkill(
    organizationSlug,
    idResult.data,
    formResult.data,
  );

  if (!result.success) {
    const messages = {
      duplicate_name:
        "Já existe uma especialidade com este nome nesta organização.",
      not_found: "A especialidade não foi encontrada.",
      unexpected: "Não foi possível salvar a especialidade. Tente novamente.",
    } as const;

    return {
      status: "error",
      fieldErrors: {},
      message: messages[result.reason],
      values,
    };
  }

  const listPath = `/app/${organizationSlug}/cadastros/especialidades`;
  revalidatePath(listPath);
  redirect(`${listPath}?feedback=updated`);
}
