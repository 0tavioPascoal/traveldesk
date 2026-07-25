import "server-only";

import { listTrips } from "@/features/trips/queries/list-trips";

export function listPlannedTrips(organizationSlug: string) {
  return listTrips(organizationSlug, { query: "", status: "planned", priority: "all", startsOn: "", endsOn: "" });
}
