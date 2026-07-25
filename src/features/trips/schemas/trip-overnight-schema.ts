import { z } from "zod";

const baseSchema = z.object({
  tripId: z.uuid("Viagem inválida."),
  expectedRevision: z.coerce.number().int().positive("Revisão do cálculo inválida."),
});

export const tripOvernightReviewSchema = baseSchema;
export const tripOvernightResetSchema = baseSchema;

export const tripOvernightAdjustmentSchema = baseSchema.extend({
  adjustedOvernights: z.preprocess(
    (value) => value === "" ? undefined : value,
    z.coerce
      .number({ error: "Informe a quantidade de pernoites." })
      .int("A quantidade deve ser um número inteiro.")
      .min(0, "A quantidade não pode ser negativa.")
      .max(3650, "A quantidade deve ser de no máximo 3.650 pernoites."),
  ),
  adjustmentReason: z
    .string()
    .trim()
    .min(5, "Explique o ajuste utilizando ao menos 5 caracteres.")
    .max(1000, "A justificativa deve possuir no máximo 1.000 caracteres."),
});

export type TripOvernightAdjustmentInput = z.infer<typeof tripOvernightAdjustmentSchema>;
