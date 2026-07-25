import { z } from "zod";

const requirement = z.object({
  skillId: z.uuid("Selecione uma especialidade válida."),
  minimumProficiencyLevel: z.coerce.number().int().min(1).max(5),
  notes: z.string().trim().max(1000, "As observações devem possuir no máximo 1.000 caracteres."),
});

export const tripRequiredSkillsSchema = z.object({
  tripId: z.uuid("Viagem inválida."),
  requirements: z.array(requirement).max(25, "Informe no máximo 25 especialidades."),
}).superRefine((value, context) => {
  const ids = value.requirements.map((item) => item.skillId);
  if (new Set(ids).size !== ids.length) {
    context.addIssue({ code: "custom", path: ["requirements"], message: "Não repita especialidades." });
  }
});

export type TripRequiredSkillsInput = z.infer<typeof tripRequiredSkillsSchema>;
