import "server-only";

import { listTrips } from "@/features/trips/queries/list-trips";

export function listDraftTrips(organizationSlug: string) {
  return listTrips(organizationSlug, { query: "", status: "draft", priority: "all", startsOn: "", endsOn: "" });
}
