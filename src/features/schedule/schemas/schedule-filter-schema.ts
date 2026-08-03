import { z } from "zod";

const first = (value: unknown) => Array.isArray(value) ? value[0] : value;
const optionalId = z.preprocess(first, z.string().uuid().catch("").default(""));
const flag = (fallback: boolean) =>
  z.preprocess(
    (value) => {
      const item = first(value);
      return item === undefined ? fallback : item === "true";
    },
    z.boolean(),
  );

export const scheduleFilterSchema = z.object({
  week: z.preprocess(first, z.string().regex(/^\d{4}-\d{2}-\d{2}$/).catch("").default("")),
  q: z.preprocess(first, z.string().trim().max(160).catch("").default("")),
  status: z.preprocess(first, z.enum([
    "all", "draft", "planned", "confirmed", "traveling", "at_client",
    "in_service", "returning", "finished", "canceled",
  ]).catch("all").default("all")),
  technicianId: optionalId,
  vehicleId: optionalId,
  showConflicts: flag(false),
  showUnavailabilities: flag(true),
});
