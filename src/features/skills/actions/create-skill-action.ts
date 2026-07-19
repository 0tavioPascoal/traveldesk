"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createSkill } from "@/features/skills/application/create-skill";
import { skillFormSchema } from "@/features/skills/schemas/skill-schema";
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

export async function createSkillAction(
  organizationSlug: string,
  _previousState: SkillActionState,
  formData: FormData,
): Promise<SkillActionState> {
  const values = readValues(formData);
  const validationResult = skillFormSchema.safeParse(values);

  if (!validationResult.success) {
    const fieldErrors = z.flattenError(validationResult.error).fieldErrors;

    return {
      status: "error",
      fieldErrors,
      message: "Revise os campos destacados.",
      values,
    };
  }

  const result = await createSkill(organizationSlug, validationResult.data);

  if (!result.success) {
    return {
      status: "error",
      fieldErrors: {},
      message:
        result.reason === "duplicate_name"
          ? "Já existe uma especialidade com este nome nesta organização."
          : "Não foi possível cadastrar a especialidade. Tente novamente.",
      values,
    };
  }

  const listPath = `/app/${organizationSlug}/cadastros/especialidades`;
  revalidatePath(listPath);
  redirect(`${listPath}?feedback=created`);
}
