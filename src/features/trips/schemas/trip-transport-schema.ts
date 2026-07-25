import { z } from "zod";

const notesSchema = z
  .string()
  .trim()
  .max(1000, "As observações devem possuir no máximo 1.000 caracteres.")
  .transform((value) => value || null);

export const tripTransportSchema = z.object({
  tripId: z.uuid("Viagem inválida."),
  vehicleId: z.uuid("Selecione um veículo válido."),
  driverTechnicianId: z.uuid("Selecione um motorista válido."),
  notes: notesSchema,
});

export const removeTripTransportSchema = z.object({
  tripId: z.uuid("Viagem inválida."),
});

export type TripTransportInput = z.infer<typeof tripTransportSchema>;
