import { z } from "zod";

export const organizationSlugSchema = z
  .string({ error: "Organização inválida." })
  .trim()
  .min(1, "Organização inválida.")
  .max(63, "Organização inválida.")
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Organização inválida.");
