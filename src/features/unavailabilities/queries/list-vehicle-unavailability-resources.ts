import "server-only";

import { requireOrganizationRole } from "@/features/organizations/application/require-organization-role";
import { createClient } from "@/lib/supabase/server";

export async function listVehicleUnavailabilityResources(
  organizationSlug: string,
  activeOnly = false,
) {
  const context = await requireOrganizationRole(organizationSlug, ["admin", "coordinator"] as const);
  const supabase = await createClient();
  let query = supabase.from("vehicles").select("id, plate, brand, model, active")
    .eq("organization_id", context.organization.id).order("brand").order("model");
  if (activeOnly) query = query.eq("active", true);
  const { data, error } = await query;
  if (error) throw new Error("Não foi possível carregar os veículos.");
  return data.map((item) => ({
    id: item.id,
    label: `${item.brand} ${item.model} — ${item.plate}`,
    active: item.active,
  }));
}
