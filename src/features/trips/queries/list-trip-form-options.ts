import "server-only";

import { requireOrganizationRole } from "@/features/organizations/application/require-organization-role";
import type { TripFormOptions } from "@/features/trips/types/trip";
import { createClient } from "@/lib/supabase/server";

type CurrentReferences = { clientId: string; clientUnitId: string; serviceTypeId: string | null };

export async function listTripFormOptions(organizationSlug: string, current?: CurrentReferences): Promise<TripFormOptions> {
  const context = await requireOrganizationRole(organizationSlug, ["admin", "coordinator"] as const);
  const supabase = await createClient();
  const [clientsResult, unitsResult, typesResult] = await Promise.all([
    supabase.from("clients").select("id, legal_name, trade_name, active").eq("organization_id", context.organization.id).order("legal_name"),
    supabase.from("client_units").select("id, client_id, name, city, state, active").eq("organization_id", context.organization.id).order("name"),
    supabase.from("service_types").select("id, name, active").eq("organization_id", context.organization.id).order("name"),
  ]);
  if (clientsResult.error || unitsResult.error || typesResult.error) throw new Error("Não foi possível carregar as opções da viagem.");
  const clients = clientsResult.data.filter((item) => item.active || item.id === current?.clientId).map((item) => ({ id: item.id, legalName: item.legal_name, tradeName: item.trade_name, active: item.active }));
  const units = unitsResult.data.filter((item) => item.active || item.id === current?.clientUnitId).map((item) => ({ id: item.id, clientId: item.client_id, name: item.name, city: item.city, state: item.state, active: item.active }));
  const serviceTypes = typesResult.data.filter((item) => item.active || item.id === current?.serviceTypeId);
  return { clients, units, serviceTypes };
}
