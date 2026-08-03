import "server-only";

import { requireOrganizationRole } from "@/features/organizations/application/require-organization-role";
import type { TechnicianOperationalTrip } from "@/features/trips/types/technician-operational-trip";
import { createClient } from "@/lib/supabase/server";

export async function listTechnicianOperationalTrips(
  organizationSlug: string,
  tripId: string | null = null,
  limit = 12,
): Promise<TechnicianOperationalTrip[]> {
  const context = await requireOrganizationRole(organizationSlug, ["technician"] as const);
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("list_my_operational_trips", {
    p_organization_id: context.organization.id,
    p_trip_id: tripId,
    p_limit: limit,
  });

  if (error) throw new Error("Não foi possível carregar suas viagens operacionais.");

  return data.map((trip) => ({
    id: trip.id,
    code: trip.code,
    title: trip.title,
    clientName: trip.client_name,
    clientUnitName: trip.client_unit_name,
    destinationCity: trip.destination_city,
    destinationState: trip.destination_state,
    travelStartsAt: trip.travel_starts_at,
    travelEndsAt: trip.travel_ends_at,
    serviceStartsAt: trip.service_starts_at,
    serviceEndsAt: trip.service_ends_at,
    priority: trip.priority,
    status: trip.status,
    isResponsible: trip.is_responsible,
  }));
}
