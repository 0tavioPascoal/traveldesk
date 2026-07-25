import "server-only";

import { evaluateTripSkillCoverage } from "@/features/trips/queries/evaluate-trip-skill-coverage";
import { listTripRequiredSkills } from "@/features/trips/queries/list-trip-required-skills";
import { listTripTechnicians } from "@/features/trips/queries/list-trip-technicians";
import type { TripTeamSummary } from "@/features/trips/types/trip-staffing";

export async function getTripTeamSummary(
  organizationSlug: string,
  tripId: string,
): Promise<TripTeamSummary> {
  const [requirements, technicians] = await Promise.all([
    listTripRequiredSkills(organizationSlug, tripId),
    listTripTechnicians(organizationSlug, tripId),
  ]);
  return { requirements, technicians, coverage: evaluateTripSkillCoverage(requirements, technicians) };
}
