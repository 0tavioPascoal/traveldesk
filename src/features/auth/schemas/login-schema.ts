import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string({ error: "Informe o e-mail." })
    .trim()
    .min(1, "Informe o e-mail.")
    .pipe(z.email("Informe um e-mail válido."))
    .transform((email) => email.toLowerCase()),
  password: z
    .string({ error: "Informe a senha." })
    .min(1, "Informe a senha."),
});

export type LoginCredentials = z.infer<typeof loginSchema>;
