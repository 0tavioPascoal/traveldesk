import { z } from "zod";

const localDate = /^\d{4}-\d{2}-\d{2}$/;
const localDateTime = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;

function validDateParts(value: string) {
  const datePart = value.slice(0, 10);
  if (!localDate.test(datePart)) return false;
  const [year, month, day] = datePart.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year
    && date.getUTCMonth() === month - 1
    && date.getUTCDate() === day;
}

const optionalText = (maximum: number, message: string) =>
  z.string().trim().max(maximum, message).transform((value) => value || null);

export const unavailabilityIdSchema = z.uuid("Indisponibilidade inválida.");

export const unavailabilityFormSchema = z
  .object({
    resourceId: z.uuid("Selecione um recurso válido."),
    unavailabilityTypeId: z.uuid("Selecione um tipo válido."),
    startsAt: z.string().trim(),
    endsAt: z.string().trim(),
    allDay: z.boolean(),
    reason: optionalText(500, "O motivo deve possuir no máximo 500 caracteres."),
    notes: optionalText(2000, "As observações devem possuir no máximo 2.000 caracteres."),
  })
  .superRefine((value, context) => {
    const pattern = value.allDay ? localDate : localDateTime;
    if (!pattern.test(value.startsAt) || !validDateParts(value.startsAt)) {
      context.addIssue({ code: "custom", path: ["startsAt"], message: "Informe uma data inicial válida." });
    }
    if (!pattern.test(value.endsAt) || !validDateParts(value.endsAt)) {
      context.addIssue({ code: "custom", path: ["endsAt"], message: "Informe uma data final válida." });
    }
    if (pattern.test(value.startsAt) && pattern.test(value.endsAt)) {
      const invalidOrder = value.allDay
        ? value.endsAt < value.startsAt
        : value.endsAt <= value.startsAt;
      if (invalidOrder) {
        context.addIssue({
          code: "custom",
          path: ["endsAt"],
          message: value.allDay
            ? "A data final não pode ser anterior à inicial."
            : "O final deve ser posterior ao início.",
        });
      }
    }
  });

export const unavailabilityStatusSchema = z.object({
  id: unavailabilityIdSchema,
  active: z.boolean(),
});

export type UnavailabilityFormInput = z.infer<typeof unavailabilityFormSchema>;
