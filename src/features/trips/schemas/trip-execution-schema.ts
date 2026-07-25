import { z } from "zod";

import { tripIdSchema } from "@/features/trips/schemas/trip-schema";

const optionalNote = z.preprocess(
  (value) => typeof value === "string" && value.trim() === "" ? null : value,
  z.string()
    .trim()
    .max(1000, "A observação deve possuir no máximo 1000 caracteres.")
    .refine((value) => !/[<>]/.test(value), "A observação contém caracteres não permitidos.")
    .nullable(),
);

export const tripExecutionTransitionSchema = z.object({
  tripId: tripIdSchema,
  targetStatus: z.enum(["traveling", "at_client", "in_service", "returning", "finished"]),
  note: optionalNote,
});
