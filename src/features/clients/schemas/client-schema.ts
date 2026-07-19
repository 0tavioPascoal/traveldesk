import { z } from "zod";

import {
  optionalCnpjSchema,
  optionalTextSchema,
} from "@/features/clients/schemas/brazilian-fields";

export const clientFormSchema = z.object({
  legalName: z
    .string({ error: "Informe a razão social." })
    .trim()
    .min(2, "A razão social deve ter pelo menos 2 caracteres.")
    .max(200, "A razão social deve ter no máximo 200 caracteres."),
  tradeName: optionalTextSchema(200, "O nome fantasia", 2),
  taxId: optionalCnpjSchema,
  segment: optionalTextSchema(120, "O segmento", 2),
  notes: optionalTextSchema(2000, "As observações"),
});

export const clientIdSchema = z.uuid("Cliente inválido.");

export const clientStatusSchema = z.object({
  id: clientIdSchema,
  active: z.boolean({ error: "Informe um status válido." }),
});

export type ClientFormInput = z.infer<typeof clientFormSchema>;
