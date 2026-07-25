import "server-only";

import { mapTripError } from "@/features/trips/application/map-trip-error";
import { prepareTripWrite } from "@/features/trips/application/prepare-trip-write";
import type { TripFormInput } from "@/features/trips/schemas/trip-schema";
import type { TripMutationResult } from "@/features/trips/types/trip";
import { createClient } from "@/lib/supabase/server";

export async function createTrip(organizationSlug: string, input: TripFormInput, planned: boolean): Promise<TripMutationResult> {
  const prepared = await prepareTripWrite(
    organizationSlug,
    input,
    planned ? "planned" : "draft",
    planned,
  );
  if (!prepared.success) return prepared.failure;
  const supabase = await createClient();
  const { data, error } = await supabase.from("trips").insert({
    ...prepared.data,
    organization_id: prepared.context.organization.id,
    code: "VGM-0000-000000",
    created_by: prepared.context.membership.profileId,
    updated_by: prepared.context.membership.profileId,
  }).select("id").single();
  if (error) return mapTripError(error);
  return { success: true, tripId: data.id };
}
