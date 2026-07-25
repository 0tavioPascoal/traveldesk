import { z } from "zod";

function first(value: unknown) {
  return Array.isArray(value) ? value[0] : value;
}

export const technicianFilterSchema = z.object({
  query: z.preprocess(first, z.string().trim().max(160).catch("").default("")),
  status: z.preprocess(first, z.enum(["all", "active", "inactive"]).catch("all").default("all")),
  skillId: z.preprocess(first, z.union([z.literal(""), z.uuid()]).catch("").default("")),
  canDrive: z.preprocess(first, z.enum(["all", "yes", "no"]).catch("all").default("all")),
  baseState: z.preprocess(first, z.union([z.literal(""), z.string().regex(/^[A-Z]{2}$/)]).catch("").default("")),
  page: z.preprocess(first, z.coerce.number().int().min(1).max(10000).catch(1).default(1)),
});
