import { z } from "zod";

function first(value: unknown) { return Array.isArray(value) ? value[0] : value; }
const date = z.preprocess(first, z.union([z.literal(""), z.string().regex(/^\d{4}-\d{2}-\d{2}$/)]).catch("").default(""));

export const tripFilterSchema = z.object({
  query: z.preprocess(first, z.string().trim().max(160).catch("").default("")),
  status: z.preprocess(first, z.enum(["all", "draft", "planned", "confirmed", "traveling", "at_client", "in_service", "returning", "finished", "canceled"]).catch("all").default("all")),
  priority: z.preprocess(first, z.enum(["all", "low", "normal", "high", "urgent"]).catch("all").default("all")),
  startsOn: date,
  endsOn: date,
  page: z.preprocess(first, z.coerce.number().int().min(1).catch(1).default(1)),
  pageSize: z.preprocess(first, z.coerce.number().pipe(z.union([z.literal(10), z.literal(20), z.literal(50)])).catch(20).default(20)),
});
