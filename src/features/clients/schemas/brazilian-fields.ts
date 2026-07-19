import { z } from "zod";

export function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

function calculateCnpjDigit(base: string, weights: readonly number[]) {
  const sum = base
    .split("")
    .reduce((total, digit, index) => total + Number(digit) * weights[index], 0);
  const remainder = sum % 11;
  return remainder < 2 ? 0 : 11 - remainder;
}

export function isValidCnpj(value: string) {
  if (!/^\d{14}$/.test(value) || /^(\d)\1{13}$/.test(value)) {
    return false;
  }

  const firstDigit = calculateCnpjDigit(
    value.slice(0, 12),
    [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2],
  );
  const secondDigit = calculateCnpjDigit(
    `${value.slice(0, 12)}${firstDigit}`,
    [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2],
  );

  return value.endsWith(`${firstDigit}${secondDigit}`);
}

export function optionalTextSchema(
  maxLength: number,
  label: string,
  minLength = 1,
) {
  return z.preprocess(
    (value) => {
      if (typeof value !== "string") {
        return value == null ? null : value;
      }

      const normalized = value.trim();
      return normalized === "" ? null : normalized;
    },
    z
      .string()
      .min(minLength, `${label} deve ter pelo menos ${minLength} caracteres.`)
      .max(maxLength, `${label} deve ter no máximo ${maxLength} caracteres.`)
      .nullable(),
  );
}

export const optionalCnpjSchema = z.preprocess(
  (value) => {
    if (typeof value !== "string") {
      return value == null ? null : value;
    }

    const normalized = digitsOnly(value);
    return normalized === "" ? null : normalized;
  },
  z
    .string()
    .length(14, "Informe um CNPJ com 14 dígitos.")
    .refine(isValidCnpj, "Informe um CNPJ válido.")
    .nullable(),
);

export const optionalPostalCodeSchema = z.preprocess(
  (value) => {
    if (typeof value !== "string") {
      return value == null ? null : value;
    }

    const normalized = digitsOnly(value);
    return normalized === "" ? null : normalized;
  },
  z
    .string()
    .length(8, "Informe um CEP com 8 dígitos.")
    .nullable(),
);

export const optionalPhoneSchema = z.preprocess(
  (value) => {
    if (typeof value !== "string") {
      return value == null ? null : value;
    }

    const normalized = digitsOnly(value);
    return normalized === "" ? null : normalized;
  },
  z
    .string()
    .regex(/^\d{10,11}$/, "Informe um telefone com DDD e 10 ou 11 dígitos.")
    .nullable(),
);

export const optionalEmailSchema = z.preprocess(
  (value) => {
    if (typeof value !== "string") {
      return value == null ? null : value;
    }

    const normalized = value.trim().toLowerCase();
    return normalized === "" ? null : normalized;
  },
  z.union([
    z.email("Informe um e-mail válido.").max(254, "O e-mail é muito longo."),
    z.null(),
  ]),
);
