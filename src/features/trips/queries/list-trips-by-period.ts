import "server-only";

import { listTrips } from "@/features/trips/queries/list-trips";

export function listTripsByPeriod(organizationSlug: string, startsOn: string, endsOn: string) {
  return listTrips(organizationSlug, { query: "", status: "all", priority: "all", startsOn, endsOn });
}
