import { z } from "zod";

import { tripIdSchema } from "@/features/trips/schemas/trip-schema";

export const tripTransitionSchema = z.object({ tripId: tripIdSchema });
export const cancelTripSchema = z.object({
  tripId: tripIdSchema,
  cancellationReason: z.string().trim().min(5, "Informe um motivo com pelo menos 5 caracteres.").max(500, "O motivo deve possuir no máximo 500 caracteres."),
});
