import { z } from "zod";

import { technicianSkillAssignmentSchema } from "@/features/technicians/schemas/technician-skill-schema";

export function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

function isValidCpf(value: string) {
  const cpf = digitsOnly(value);
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
  const digit = (length: number) => {
    const sum = cpf
      .slice(0, length)
      .split("")
      .reduce((total, number, index) => total + Number(number) * (length + 1 - index), 0);
    const remainder = (sum * 10) % 11;
    return remainder === 10 ? 0 : remainder;
  };
  return digit(9) === Number(cpf[9]) && digit(10) === Number(cpf[10]);
}

const optionalText = (maximum: number, message: string) =>
  z.string().trim().max(maximum, message).transform((value) => value || null);

const optionalEmail = z
  .string()
  .trim()
  .toLowerCase()
  .max(254, "O e-mail deve possuir no máximo 254 caracteres.")
  .refine((value) => !value || z.email().safeParse(value).success, "Informe um e-mail válido.")
  .transform((value) => value || null);

const optionalCpf = z
  .string()
  .transform(digitsOnly)
  .refine((value) => !value || isValidCpf(value), "Informe um CPF válido.")
  .transform((value) => value || null);

const optionalPhone = z
  .string()
  .transform(digitsOnly)
  .refine(
    (value) => !value || (value.length >= 10 && value.length <= 11),
    "Informe um telefone com DDD.",
  )
  .transform((value) => value || null);

const optionalLicenseNumber = z
  .string()
  .transform(digitsOnly)
  .refine((value) => !value || value.length === 11, "A CNH deve possuir 11 dígitos.")
  .transform((value) => value || null);

const licenseCategorySchema = z
  .string()
  .trim()
  .toUpperCase()
  .refine(
    (value) => !value || ["A", "B", "C", "D", "E", "AB", "AC", "AD", "AE"].includes(value),
    "Selecione uma categoria de CNH válida.",
  )
  .transform((value) => value || null);

export const technicianFormSchema = z
  .object({
    name: z.string().trim().min(2, "Informe o nome do técnico.").max(160, "O nome deve possuir no máximo 160 caracteres."),
    document: optionalCpf,
    email: optionalEmail,
    phone: optionalPhone,
    jobTitle: optionalText(120, "O cargo deve possuir no máximo 120 caracteres."),
    baseCity: z.string().trim().min(2, "Informe a cidade-base.").max(120, "A cidade-base deve possuir no máximo 120 caracteres."),
    baseState: z.string().trim().toUpperCase().regex(/^[A-Z]{2}$/, "Selecione um estado válido."),
    driverLicenseNumber: optionalLicenseNumber,
    driverLicenseCategory: licenseCategorySchema,
    driverLicenseExpiresAt: z.string().refine(
      (value) => !value || /^\d{4}-\d{2}-\d{2}$/.test(value),
      "Informe uma validade de CNH válida.",
    ).transform((value) => value || null),
    canDriveCompanyVehicle: z.boolean(),
    notes: optionalText(2000, "As observações devem possuir no máximo 2.000 caracteres."),
    skillAssignments: z.array(technicianSkillAssignmentSchema).max(50, "Limite de especialidades excedido."),
  })
  .superRefine((value, context) => {
    const ids = value.skillAssignments.map((assignment) => assignment.skillId);
    if (new Set(ids).size !== ids.length) {
      context.addIssue({ code: "custom", path: ["skillAssignments"], message: "Não repita a mesma especialidade." });
    }
    if (value.skillAssignments.filter((assignment) => assignment.isPrimary).length > 1) {
      context.addIssue({ code: "custom", path: ["skillAssignments"], message: "Defina no máximo uma especialidade principal." });
    }
    if (value.canDriveCompanyVehicle) {
      if (!value.driverLicenseNumber) context.addIssue({ code: "custom", path: ["driverLicenseNumber"], message: "Informe o número da CNH." });
      if (!value.driverLicenseCategory) context.addIssue({ code: "custom", path: ["driverLicenseCategory"], message: "Informe a categoria da CNH." });
      if (!value.driverLicenseExpiresAt) context.addIssue({ code: "custom", path: ["driverLicenseExpiresAt"], message: "Informe a validade da CNH." });
    }
  });

export type TechnicianFormInput = z.infer<typeof technicianFormSchema>;
