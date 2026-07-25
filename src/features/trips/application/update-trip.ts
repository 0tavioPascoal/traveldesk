import "server-only";

import { mapTripError } from "@/features/trips/application/map-trip-error";
import { prepareTripWrite } from "@/features/trips/application/prepare-trip-write";
import type { TripFormInput } from "@/features/trips/schemas/trip-schema";
import type { TripMutationResult } from "@/features/trips/types/trip";
import { requireOrganizationRole } from "@/features/organizations/application/require-organization-role";
import { createClient } from "@/lib/supabase/server";

export async function updateTrip(organizationSlug: string, tripId: string, input: TripFormInput, plan: boolean): Promise<TripMutationResult> {
  const context = await requireOrganizationRole(organizationSlug, ["admin", "coordinator"] as const);
  const supabase = await createClient();
  const currentResult = await supabase.from("trips").select("id, client_id, client_unit_id, service_type_id, status")
    .eq("organization_id", context.organization.id).eq("id", tripId).maybeSingle();
  if (currentResult.error) return { success: false, reason: "unexpected" };
  if (!currentResult.data) return { success: false, reason: "not_found" };
  if (currentResult.data.status !== "draft" && currentResult.data.status !== "planned") {
    return { success: false, reason: "invalid_transition" };
  }
  const target = plan ? "planned" : currentResult.data.status;
  const prepared = await prepareTripWrite(organizationSlug, input, target, plan, {
    clientId: currentResult.data.client_id, clientUnitId: currentResult.data.client_unit_id,
    serviceTypeId: currentResult.data.service_type_id,
  });
  if (!prepared.success) return prepared.failure;
  const { data, error } = await supabase.from("trips").update({ ...prepared.data, updated_by: context.membership.profileId })
    .eq("organization_id", context.organization.id).eq("id", tripId).select("id").maybeSingle();
  if (error) return mapTripError(error);
  return data ? { success: true, tripId: data.id } : { success: false, reason: "not_found" };
}
