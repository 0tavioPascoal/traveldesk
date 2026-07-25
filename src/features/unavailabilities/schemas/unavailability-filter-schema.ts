import { z } from "zod";

function first(value: unknown) {
  return Array.isArray(value) ? value[0] : value;
}

const optionalUuid = z.preprocess(
  first,
  z.union([z.literal(""), z.uuid()]).catch("").default(""),
);
const optionalDate = z.preprocess(
  first,
  z.union([z.literal(""), z.string().regex(/^\d{4}-\d{2}-\d{2}$/)]).catch("").default(""),
);

export const unavailabilityFilterSchema = z.object({
  resource: z.preprocess(
    first,
    z.enum(["all", "technicians", "vehicles"]).catch("all").default("all"),
  ),
  query: z.preprocess(first, z.string().trim().max(160).catch("").default("")),
  startsOn: optionalDate,
  endsOn: optionalDate,
  resourceId: optionalUuid,
  unavailabilityTypeId: optionalUuid,
  temporalStatus: z.preprocess(
    first,
    z.enum(["all", "current", "future", "past"]).catch("all").default("all"),
  ),
  status: z.preprocess(
    first,
    z.enum(["all", "active", "inactive"]).catch("all").default("all"),
  ),
  page: z.preprocess(first, z.coerce.number().int().positive().catch(1).default(1)),
});

export const unavailabilityTypeFilterSchema = z.object({
  query: z.preprocess(first, z.string().trim().max(160).catch("").default("")),
  status: z.preprocess(
    first,
    z.enum(["all", "active", "inactive"]).catch("all").default("all"),
  ),
});
