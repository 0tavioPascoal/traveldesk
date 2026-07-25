import { z } from "zod";

export const tripConfirmationSchema = z.object({
  tripId: z.uuid("Viagem inválida."),
});
