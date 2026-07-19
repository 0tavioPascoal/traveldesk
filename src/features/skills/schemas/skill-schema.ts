import { z } from "zod";

const descriptionSchema = z.preprocess(
  (value) => {
    if (typeof value !== "string") {
      return value;
    }

    const description = value.trim();
    return description === "" ? null : description;
  },
  z
    .string()
    .max(1000, "A descrição deve ter no máximo 1.000 caracteres.")
    .nullable(),
);

export const skillFormSchema = z.object({
  name: z
    .string({ error: "Informe o nome da especialidade." })
    .trim()
    .min(2, "O nome deve ter pelo menos 2 caracteres.")
    .max(120, "O nome deve ter no máximo 120 caracteres."),
  description: descriptionSchema,
  active: z.boolean({ error: "Informe um status válido." }),
});

export const skillIdSchema = z.uuid("Especialidade inválida.");

export const skillStatusSchema = z.object({
  id: skillIdSchema,
  active: z.boolean({ error: "Informe um status válido." }),
});

export type SkillFormInput = z.infer<typeof skillFormSchema>;
