import "server-only";

import { requireOrganizationMember } from "@/features/organizations/application/require-organization-member";
import type { TripStatusHistoryItem } from "@/features/trips/types/trip-execution";
import { createClient } from "@/lib/supabase/server";

export async function listTripStatusHistory(
  organizationSlug: string,
  tripId: string,
): Promise<TripStatusHistoryItem[]> {
  const context = await requireOrganizationMember(organizationSlug);
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("list_trip_status_history", {
    p_organization_id: context.organization.id,
    p_trip_id: tripId,
  });
  if (error) throw new Error("Não foi possível carregar o histórico da viagem.");
  return data.map((item) => ({
    id: item.id,
    fromStatus: item.from_status,
    toStatus: item.to_status,
    occurredAt: item.occurred_at,
    changedBy: item.changed_by,
    changedByName: item.changed_by_name,
    note: item.note,
  }));
}
