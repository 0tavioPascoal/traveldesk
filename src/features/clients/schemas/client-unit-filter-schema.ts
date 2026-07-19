import { z } from "zod";

function firstSearchParam(value: unknown) {
  return Array.isArray(value) ? value[0] : value;
}

export const clientUnitFilterSchema = z.object({
  query: z.preprocess(
    firstSearchParam,
    z.string().trim().max(160).catch("").default(""),
  ),
  status: z.preprocess(
    firstSearchParam,
    z.enum(["all", "active", "inactive"]).catch("all").default("all"),
  ),
});
