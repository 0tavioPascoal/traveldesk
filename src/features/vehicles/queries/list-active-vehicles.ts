import "server-only";

import type { ActiveVehicle } from "@/features/vehicles/types/vehicle";
import { requireOrganizationRole } from "@/features/organizations/application/require-organization-role";
import { createClient } from "@/lib/supabase/server";

export async function listActiveVehicles(
  organizationSlug: string,
): Promise<ActiveVehicle[]> {
  const context = await requireOrganizationRole(
    organizationSlug,
    ["admin", "coordinator"] as const,
  );
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("vehicles")
    .select("id, plate, brand, model, operational_status")
    .eq("organization_id", context.organization.id)
    .eq("active", true)
    .order("brand")
    .order("model");
  if (error) throw new Error("Não foi possível carregar os veículos ativos.");
  return data;
}
