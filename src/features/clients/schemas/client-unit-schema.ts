import { z } from "zod";

import {
  optionalCnpjSchema,
  optionalEmailSchema,
  optionalPhoneSchema,
  optionalPostalCodeSchema,
  optionalTextSchema,
} from "@/features/clients/schemas/brazilian-fields";
import { clientIdSchema } from "@/features/clients/schemas/client-schema";

export const clientUnitFormSchema = z.object({
  clientId: clientIdSchema,
  name: z
    .string({ error: "Informe o nome da unidade." })
    .trim()
    .min(2, "O nome deve ter pelo menos 2 caracteres.")
    .max(160, "O nome deve ter no máximo 160 caracteres."),
  taxId: optionalCnpjSchema,
  addressLine: optionalTextSchema(200, "O logradouro"),
  addressNumber: optionalTextSchema(30, "O número"),
  addressComplement: optionalTextSchema(120, "O complemento"),
  district: optionalTextSchema(120, "O bairro"),
  city: z
    .string({ error: "Informe a cidade." })
    .trim()
    .min(2, "A cidade deve ter pelo menos 2 caracteres.")
    .max(120, "A cidade deve ter no máximo 120 caracteres."),
  state: z
    .string({ error: "Informe o estado." })
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{2}$/, "Informe uma UF válida."),
  postalCode: optionalPostalCodeSchema,
  contactName: optionalTextSchema(160, "O nome do contato"),
  contactEmail: optionalEmailSchema,
  contactPhone: optionalPhoneSchema,
  accessInstructions: optionalTextSchema(2000, "As instruções de acesso"),
  notes: optionalTextSchema(2000, "As observações"),
});

export const clientUnitIdSchema = z.uuid("Unidade inválida.");

export const clientUnitStatusSchema = z.object({
  clientId: clientIdSchema,
  unitId: clientUnitIdSchema,
  active: z.boolean({ error: "Informe um status válido." }),
});

export type ClientUnitFormInput = z.infer<typeof clientUnitFormSchema>;
