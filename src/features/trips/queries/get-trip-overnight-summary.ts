import "server-only";

import { requireOrganizationRole } from "@/features/organizations/application/require-organization-role";
import type { TripOvernightSummary } from "@/features/trips/types/trip-overnight";
import { createClient } from "@/lib/supabase/server";

export async function getTripOvernightSummary(
  organizationSlug: string,
  tripId: string,
): Promise<TripOvernightSummary> {
  const context = await requireOrganizationRole(organizationSlug, ["admin", "coordinator"] as const);
  const supabase = await createClient();
  const [tripResult, overnightResult, teamResult] = await Promise.all([
    supabase
      .from("trips")
      .select("status, travel_starts_at, travel_ends_at")
      .eq("organization_id", context.organization.id)
      .eq("id", tripId)
      .maybeSingle(),
    supabase
      .from("trip_overnights")
      .select("calculated_overnights, adjusted_overnights, adjustment_reason, calculated_for_travel_starts_at, calculated_for_travel_ends_at, calculation_timezone, reviewed_at, adjusted_at, revision")
      .eq("organization_id", context.organization.id)
      .eq("trip_id", tripId)
      .maybeSingle(),
    supabase
      .from("trip_technicians")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", context.organization.id)
      .eq("trip_id", tripId),
  ]);
  if (tripResult.error || overnightResult.error || teamResult.error) {
    throw new Error("Não foi possível carregar os pernoites da viagem.");
  }

  const trip = tripResult.data;
  const overnight = overnightResult.data;
  const periodValid = Boolean(
    trip?.travel_starts_at
      && trip.travel_ends_at
      && new Date(trip.travel_ends_at).getTime() > new Date(trip.travel_starts_at).getTime(),
  );
  const isOutdated = !periodValid || !overnight
    || overnight.calculated_for_travel_starts_at !== trip?.travel_starts_at
    || overnight.calculated_for_travel_ends_at !== trip?.travel_ends_at
    || overnight.calculation_timezone !== context.organization.timezone;
  const effective = !isOutdated && overnight
    ? overnight.adjusted_overnights ?? overnight.calculated_overnights
    : null;
  const technicianCount = teamResult.count ?? 0;
  const isReviewed = Boolean(overnight?.reviewed_at) && !isOutdated;

  return {
    calculatedOvernights: !isOutdated ? overnight?.calculated_overnights ?? null : null,
    adjustedOvernights: !isOutdated ? overnight?.adjusted_overnights ?? null : null,
    effectiveOvernights: effective,
    technicianCount,
    estimatedPersonOvernights: effective === null ? null : effective * technicianCount,
    isAdjusted: !isOutdated && overnight?.adjusted_overnights !== null && overnight?.adjusted_overnights !== undefined,
    isReviewed,
    isOutdated,
    overnightsReadyForConfirmation: periodValid && !isOutdated && isReviewed,
    adjustmentReason: !isOutdated ? overnight?.adjustment_reason ?? null : null,
    calculationTimezone: overnight?.calculation_timezone ?? null,
    calculatedForTravelStartsAt: overnight?.calculated_for_travel_starts_at ?? null,
    calculatedForTravelEndsAt: overnight?.calculated_for_travel_ends_at ?? null,
    reviewedAt: !isOutdated ? overnight?.reviewed_at ?? null : null,
    adjustedAt: !isOutdated ? overnight?.adjusted_at ?? null : null,
    revision: overnight?.revision ?? null,
    periodValid,
  };
}
