import { z } from "zod";

function first(value: unknown) {
  return Array.isArray(value) ? value[0] : value;
}

export const dashboardFilterSchema = z.object({
  period: z.preprocess(
    first,
    z.enum(["today", "week", "next7", "next30"]).catch("week").default("week"),
  ),
  status: z.preprocess(
    first,
    z.enum([
      "all",
      "draft",
      "planned",
      "confirmed",
      "traveling",
      "at_client",
      "in_service",
      "returning",
      "finished",
      "canceled",
    ]).catch("all").default("all"),
  ),
  priority: z.preprocess(
    first,
    z.enum(["all", "low", "normal", "high", "urgent"]).catch("all").default("all"),
  ),
});
