import { z } from "zod";

function first(value: unknown) {
  return Array.isArray(value) ? value[0] : value;
}

const identifier = z.preprocess(
  first,
  z.union([z.literal("all"), z.string().uuid()]).catch("all").default("all"),
);

const dateKey = z.preprocess(
  first,
  z.string().regex(/^\d{4}-\d{2}-\d{2}$/).catch("").default(""),
);

export const analyticsFilterSchema = z.object({
  period: z.preprocess(
    first,
    z.enum(["today", "week", "last7", "last30", "last90", "custom"])
      .catch("week")
      .default("week"),
  ),
  startDate: dateKey,
  endDate: dateKey,
  clientId: identifier,
  unitId: identifier,
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
    z.enum(["all", "low", "normal", "high", "urgent"])
      .catch("all")
      .default("all"),
  ),
  technicianId: identifier,
  vehicleId: identifier,
  serviceTypeId: identifier,
});
