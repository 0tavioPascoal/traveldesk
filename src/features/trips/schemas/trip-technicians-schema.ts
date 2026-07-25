import { z } from "zod";

const member = z.object({
  technicianId: z.uuid("Técnico inválido."),
  isResponsible: z.boolean(),
  notes: z.string().trim().max(1000, "As observações devem possuir no máximo 1.000 caracteres."),
});

export const tripTechniciansSchema = z.object({
  tripId: z.uuid("Viagem inválida."),
  technicians: z.array(member).max(30, "Informe no máximo 30 técnicos."),
}).superRefine((value, context) => {
  const ids = value.technicians.map((item) => item.technicianId);
  if (new Set(ids).size !== ids.length) {
    context.addIssue({ code: "custom", path: ["technicians"], message: "Não repita técnicos." });
  }
  if (value.technicians.filter((item) => item.isResponsible).length > 1) {
    context.addIssue({ code: "custom", path: ["technicians"], message: "Defina no máximo um responsável." });
  }
});

export const tripResponsibleSchema = z.object({
  tripId: z.uuid("Viagem inválida."),
  technicianId: z.union([z.literal(""), z.uuid("Técnico inválido.")]).transform((value) => value || null),
});

export type TripTechniciansInput = z.infer<typeof tripTechniciansSchema>;
