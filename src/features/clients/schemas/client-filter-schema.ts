import { z } from "zod";

function firstSearchParam(value: unknown) {
  return Array.isArray(value) ? value[0] : value;
}

export const clientFilterSchema = z.object({
  query: z.preprocess(
    firstSearchParam,
    z.string().trim().max(200).catch("").default(""),
  ),
  status: z.preprocess(
    firstSearchParam,
    z.enum(["all", "active", "inactive"]).catch("all").default("all"),
  ),
  page: z.preprocess(
    firstSearchParam,
    z.coerce.number().int().min(1).catch(1).default(1),
  ),
  pageSize: z.preprocess(
    firstSearchParam,
    z.coerce.number().pipe(z.union([z.literal(10), z.literal(20), z.literal(50)])).catch(20).default(20),
  ),
});
