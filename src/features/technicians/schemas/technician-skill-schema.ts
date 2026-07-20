import { z } from "zod";

export const technicianSkillAssignmentSchema = z.object({
  skillId: z.uuid("Selecione uma especialidade válida."),
  proficiencyLevel: z.coerce
    .number()
    .int()
    .min(1, "Informe um nível entre 1 e 5.")
    .max(5, "Informe um nível entre 1 e 5."),
  isPrimary: z.boolean(),
});
