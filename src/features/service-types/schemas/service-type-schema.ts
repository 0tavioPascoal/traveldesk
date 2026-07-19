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

export const serviceTypeFormSchema = z.object({
  name: z
    .string({ error: "Informe o nome do tipo de atendimento." })
    .trim()
    .min(2, "O nome deve ter pelo menos 2 caracteres.")
    .max(120, "O nome deve ter no máximo 120 caracteres."),
  description: descriptionSchema,
  active: z.boolean({ error: "Informe um status válido." }),
});

export const serviceTypeIdSchema = z.uuid("Tipo de atendimento inválido.");

export const serviceTypeStatusSchema = z.object({
  id: serviceTypeIdSchema,
  active: z.boolean({ error: "Informe um status válido." }),
});

export type ServiceTypeFormInput = z.infer<typeof serviceTypeFormSchema>;
