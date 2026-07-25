import { z } from "zod";

const localDateTime = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;
const states = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"] as const;
const optionalText = (maximum: number, message: string) => z.string().trim().max(maximum, message).transform((value) => value || null);
const optionalDateTime = z.union([z.literal(""), z.string().regex(localDateTime, "Informe uma data e hora válidas.")]).transform((value) => value || null);
const optionalState = z.union([z.literal(""), z.enum(states)]).transform((value) => value || null);

const fields = z.object({
  clientId: z.uuid("Selecione um cliente válido."),
  clientUnitId: z.uuid("Selecione uma unidade válida."),
  serviceTypeId: z.union([z.literal(""), z.uuid("Selecione um tipo válido.")]).transform((value) => value || null),
  title: z.string().trim().min(3, "O título deve possuir pelo menos 3 caracteres.").max(200, "O título deve possuir no máximo 200 caracteres."),
  reason: optionalText(500, "O motivo deve possuir no máximo 500 caracteres."),
  description: optionalText(5000, "A descrição deve possuir no máximo 5.000 caracteres."),
  priority: z.enum(["low", "normal", "high", "urgent"], { error: "Selecione uma prioridade válida." }),
  travelStartsAt: optionalDateTime,
  travelEndsAt: optionalDateTime,
  serviceStartsAt: optionalDateTime,
  serviceEndsAt: optionalDateTime,
  originCity: optionalText(120, "A cidade de origem deve possuir no máximo 120 caracteres."),
  originState: optionalState,
  destinationCity: optionalText(120, "A cidade de destino deve possuir no máximo 120 caracteres."),
  destinationState: optionalState,
  notes: optionalText(3000, "As observações devem possuir no máximo 3.000 caracteres."),
});

export const tripFormSchema = fields.superRefine((value, context) => {
  const pairs: Array<["travelStartsAt" | "serviceStartsAt", "travelEndsAt" | "serviceEndsAt", string]> = [
    ["travelStartsAt", "travelEndsAt", "deslocamento"],
    ["serviceStartsAt", "serviceEndsAt", "atendimento"],
  ];
  for (const [start, end, label] of pairs) {
    if (Boolean(value[start]) !== Boolean(value[end])) {
      context.addIssue({ code: "custom", path: [end], message: `Informe início e fim do ${label}.` });
    } else if (value[start] && value[end] && value[end] <= value[start]) {
      context.addIssue({ code: "custom", path: [end], message: "O final deve ser posterior ao início." });
    }
  }
  if (Boolean(value.originCity) !== Boolean(value.originState)) {
    context.addIssue({ code: "custom", path: ["originState"], message: "Informe cidade e UF de origem." });
  }
  if (Boolean(value.destinationCity) !== Boolean(value.destinationState)) {
    context.addIssue({ code: "custom", path: ["destinationState"], message: "Informe cidade e UF de destino." });
  }
  if (value.serviceStartsAt && !value.travelStartsAt) {
    context.addIssue({ code: "custom", path: ["travelStartsAt"], message: "Informe o período da viagem antes do atendimento." });
  }
  if (value.travelStartsAt && value.travelEndsAt && value.serviceStartsAt && value.serviceEndsAt
    && (value.serviceStartsAt < value.travelStartsAt || value.serviceEndsAt > value.travelEndsAt)) {
    context.addIssue({ code: "custom", path: ["serviceEndsAt"], message: "O atendimento deve estar dentro do período da viagem." });
  }
});

export const tripIdSchema = z.uuid("Viagem inválida.");
export const tripSubmissionIntentSchema = z.enum(["draft", "planned"]);
export type TripFormInput = z.infer<typeof tripFormSchema>;
