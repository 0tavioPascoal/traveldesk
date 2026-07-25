import "server-only";

import { normalizeTripPeriods } from "@/features/trips/application/normalize-trip-periods";
import type { TripFormInput } from "@/features/trips/schemas/trip-schema";
import type { TripMutationResult, TripStatus } from "@/features/trips/types/trip";
import { requireOrganizationRole } from "@/features/organizations/application/require-organization-role";
import { createClient } from "@/lib/supabase/server";

type Current = { clientId: string; clientUnitId: string; serviceTypeId: string | null } | null;
type Failure = Exclude<TripMutationResult, { success: true }>;

export async function prepareTripWrite(
  organizationSlug: string,
  input: TripFormInput,
  targetStatus: Extract<TripStatus, "draft" | "planned">,
  validateForPlanning: boolean,
  current: Current = null,
) {
  const context = await requireOrganizationRole(organizationSlug, ["admin", "coordinator"] as const);
  const periods = normalizeTripPeriods(input, context.organization.timezone);
  if (!periods.success) return { success: false as const, failure: { success: false, reason: "invalid_period" } satisfies Failure };
  const supabase = await createClient();
  const [clientResult, unitResult, typeResult] = await Promise.all([
    supabase.from("clients").select("id, legal_name, trade_name, active").eq("organization_id", context.organization.id).eq("id", input.clientId).maybeSingle(),
    supabase.from("client_units").select("id, client_id, name, city, state, active").eq("organization_id", context.organization.id).eq("id", input.clientUnitId).eq("client_id", input.clientId).maybeSingle(),
    input.serviceTypeId
      ? supabase.from("service_types").select("id, active").eq("organization_id", context.organization.id).eq("id", input.serviceTypeId).maybeSingle()
      : Promise.resolve({ data: null, error: null }),
  ]);
  if (clientResult.error || unitResult.error || typeResult.error) return { success: false as const, failure: { success: false, reason: "unexpected" } satisfies Failure };
  if (!clientResult.data) return { success: false as const, failure: { success: false, reason: "client_not_available" } satisfies Failure };
  if (!unitResult.data) return { success: false as const, failure: { success: false, reason: "unit_not_available" } satisfies Failure };
  const relationshipChanged = !current || current.clientId !== input.clientId || current.clientUnitId !== input.clientUnitId;
  if ((relationshipChanged || validateForPlanning) && (!clientResult.data.active || !unitResult.data.active)) {
    return { success: false as const, failure: { success: false, reason: !clientResult.data.active ? "client_not_available" : "unit_not_available" } satisfies Failure };
  }
  const typeChanged = current?.serviceTypeId !== input.serviceTypeId;
  if (input.serviceTypeId && !typeResult.data) return { success: false as const, failure: { success: false, reason: "service_type_not_available" } satisfies Failure };
  if (input.serviceTypeId && (typeChanged || validateForPlanning) && !typeResult.data?.active) {
    return { success: false as const, failure: { success: false, reason: "service_type_not_available" } satisfies Failure };
  }
  const destinationCity = input.destinationCity ?? unitResult.data.city;
  const destinationState = input.destinationState ?? unitResult.data.state;
  if (targetStatus === "planned" && (!input.serviceTypeId || !periods.travelStartsAt || !periods.travelEndsAt
    || !periods.serviceStartsAt || !periods.serviceEndsAt || !input.originCity || !input.originState
    || !destinationCity || !destinationState)) {
    return { success: false as const, failure: { success: false, reason: "incomplete_for_planning" } satisfies Failure };
  }
  return {
    success: true as const,
    context,
    data: {
      client_id: input.clientId,
      client_unit_id: input.clientUnitId,
      service_type_id: input.serviceTypeId,
      client_name_snapshot: clientResult.data.trade_name ?? clientResult.data.legal_name,
      client_legal_name_snapshot: clientResult.data.legal_name,
      client_trade_name_snapshot: clientResult.data.trade_name,
      client_unit_name_snapshot: unitResult.data.name,
      title: input.title,
      reason: input.reason,
      description: input.description,
      priority: input.priority,
      status: targetStatus,
      travel_starts_at: periods.travelStartsAt,
      travel_ends_at: periods.travelEndsAt,
      service_starts_at: periods.serviceStartsAt,
      service_ends_at: periods.serviceEndsAt,
      origin_city: input.originCity,
      origin_state: input.originState,
      destination_city: destinationCity,
      destination_state: destinationState,
      notes: input.notes,
    },
  };
}
