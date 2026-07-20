import { z } from "zod";

function first(value: unknown) {
  return Array.isArray(value) ? value[0] : value;
}

export const vehicleFilterSchema = z.object({
  query: z.preprocess(first, z.string().trim().max(160).catch("").default("")),
  activeState: z.preprocess(
    first,
    z.enum(["all", "active", "inactive"]).catch("all").default("all"),
  ),
  operationalStatus: z.preprocess(
    first,
    z.enum(["all", "available", "maintenance", "blocked"]).catch("all").default("all"),
  ),
  baseState: z.preprocess(
    first,
    z.union([z.literal(""), z.string().trim().toUpperCase().regex(/^[A-Z]{2}$/)]).catch("").default(""),
  ),
});
