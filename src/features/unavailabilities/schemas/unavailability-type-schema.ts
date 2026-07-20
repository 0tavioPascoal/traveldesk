import { z } from "zod";

const optionalDescription = z
  .string()
  .trim()
  .max(1000, "A descrição deve possuir no máximo 1.000 caracteres.")
  .transform((value) => value || null);

export const unavailabilityTypeFormSchema = z.object({
  name: z
    .string({ error: "Informe o nome do tipo." })
    .trim()
    .min(2, "O nome deve possuir pelo menos 2 caracteres.")
    .max(120, "O nome deve possuir no máximo 120 caracteres."),
  description: optionalDescription,
  active: z.boolean({ error: "Informe um status válido." }),
});

export const unavailabilityTypeIdSchema = z.uuid("Tipo de indisponibilidade inválido.");
export const unavailabilityTypeStatusSchema = z.object({
  id: unavailabilityTypeIdSchema,
  active: z.boolean({ error: "Informe um status válido." }),
});

export type UnavailabilityTypeFormInput = z.infer<
  typeof unavailabilityTypeFormSchema
>;
