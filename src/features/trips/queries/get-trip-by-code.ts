import "server-only";

import { requireOrganizationRole } from "@/features/organizations/application/require-organization-role";
import type { TripDetails } from "@/features/trips/types/trip";
import { createClient } from "@/lib/supabase/server";

export async function getTripByCode(organizationSlug: string, code: string): Promise<TripDetails | null> {
  const context = await requireOrganizationRole(organizationSlug, ["admin", "coordinator"] as const);
  const supabase = await createClient();
  const { data, error } = await supabase.from("trips").select("*, service_types(name)")
    .eq("organization_id", context.organization.id).eq("code", code.trim().toUpperCase()).maybeSingle();
  if (error) throw new Error("Não foi possível carregar a viagem.");
  if (!data) return null;
  const { service_types: serviceType, ...trip } = data;
  return { ...trip, serviceTypeName: serviceType?.name ?? null };
}
