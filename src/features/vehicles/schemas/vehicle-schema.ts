import { z } from "zod";

const operationalStatuses = ["available", "maintenance", "blocked"] as const;

export function normalizePlate(value: string) {
  return value.trim().replace(/[\s-]/g, "").toUpperCase();
}

function optionalInteger(minimum: number, maximum: number, message: string) {
  return z.preprocess(
    (value) => value === "" || value === null || value === undefined ? null : Number(value),
    z.number().int(message).min(minimum, message).max(maximum, message).nullable(),
  );
}

function isValidDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year
    && date.getUTCMonth() === month - 1
    && date.getUTCDate() === day;
}

const optionalDate = z
  .string()
  .trim()
  .refine(
    (value) => !value || isValidDate(value),
    "Informe uma data válida.",
  )
  .transform((value) => value || null);

const currentYear = new Date().getFullYear();

export const vehicleFormSchema = z
  .object({
    plate: z
      .string()
      .transform(normalizePlate)
      .refine(
        (value) => /^(?:[A-Z]{3}[0-9]{4}|[A-Z]{3}[0-9][A-Z][0-9]{2})$/.test(value),
        "Informe uma placa brasileira válida.",
      ),
    brand: z.string().trim().min(2, "Informe a marca do veículo.").max(80, "A marca deve possuir no máximo 80 caracteres."),
    model: z.string().trim().min(2, "Informe o modelo do veículo.").max(120, "O modelo deve possuir no máximo 120 caracteres."),
    manufactureYear: optionalInteger(1900, currentYear + 1, `Informe um ano entre 1900 e ${currentYear + 1}.`),
    modelYear: optionalInteger(1900, currentYear + 1, `Informe um ano entre 1900 e ${currentYear + 1}.`),
    passengerCapacity: z.coerce.number().int("Informe uma capacidade inteira.").min(1, "A capacidade deve ser maior que zero.").max(99, "A capacidade deve ser de no máximo 99 pessoas."),
    baseCity: z.string().trim().min(2, "Informe a cidade-base.").max(120, "A cidade-base deve possuir no máximo 120 caracteres."),
    baseState: z.string().trim().toUpperCase().regex(/^[A-Z]{2}$/, "Selecione um estado válido."),
    currentMileage: optionalInteger(0, Number.MAX_SAFE_INTEGER, "Informe uma quilometragem inteira e não negativa."),
    operationalStatus: z.enum(operationalStatuses, "Selecione uma condição operacional válida."),
    licensingExpiresAt: optionalDate,
    maintenanceDueAt: optionalDate,
    notes: z.string().trim().max(2000, "As observações devem possuir no máximo 2.000 caracteres.").transform((value) => value || null),
  })
  .superRefine((value, context) => {
    if (
      value.manufactureYear !== null &&
      value.modelYear !== null &&
      (value.modelYear < value.manufactureYear || value.modelYear > value.manufactureYear + 1)
    ) {
      context.addIssue({
        code: "custom",
        path: ["modelYear"],
        message: "O ano do modelo deve ser igual ou um ano superior ao de fabricação.",
      });
    }
  });

export const vehicleIdSchema = z.uuid("Veículo inválido.");
export const vehicleActiveStateSchema = z.object({ id: vehicleIdSchema, active: z.boolean() });
export const vehicleOperationalStatusSchema = z.object({
  id: vehicleIdSchema,
  operationalStatus: z.enum(operationalStatuses),
});

export type VehicleFormInput = z.infer<typeof vehicleFormSchema>;
