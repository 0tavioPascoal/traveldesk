import { z } from "zod";

function firstSearchParam(value: unknown) {
  return Array.isArray(value) ? value[0] : value;
}

export const serviceTypeFilterSchema = z.object({
  query: z.preprocess(
    firstSearchParam,
    z.string().trim().max(120).catch("").default(""),
  ),
  status: z.preprocess(
    firstSearchParam,
    z.enum(["all", "active", "inactive"]).catch("all").default("all"),
  ),
});
