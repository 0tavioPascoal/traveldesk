"use server";

import { revalidatePath } from "next/cache";

import { changeSkillStatus } from "@/features/skills/application/change-skill-status";
import { skillStatusSchema } from "@/features/skills/schemas/skill-schema";
import type { SkillStatusActionState } from "@/features/skills/types/skill";

export async function changeSkillStatusAction(
  organizationSlug: string,
  skillId: string,
  active: boolean,
  _previousState: SkillStatusActionState,
  _formData: FormData,
): Promise<SkillStatusActionState> {
  void _previousState;
  void _formData;

  const validationResult = skillStatusSchema.safeParse({
    id: skillId,
    active,
  });

  if (!validationResult.success) {
    return {
      status: "error",
      message: "Não foi possível identificar a especialidade.",
    };
  }

  const result = await changeSkillStatus(
    organizationSlug,
    validationResult.data.id,
    validationResult.data.active,
  );

  if (!result.success) {
    return {
      status: "error",
      message:
        result.reason === "not_found"
          ? "A especialidade não foi encontrada."
          : "Não foi possível alterar o status da especialidade.",
    };
  }

  revalidatePath(`/app/${organizationSlug}/cadastros/especialidades`);

  return {
    status: "success",
    message: active
      ? "Especialidade ativada com sucesso."
      : "Especialidade inativada com sucesso.",
  };
}
