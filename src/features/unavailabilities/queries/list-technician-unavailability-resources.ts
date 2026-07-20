import "server-only";

import { requireOrganizationRole } from "@/features/organizations/application/require-organization-role";
import { createClient } from "@/lib/supabase/server";

export async function listTechnicianUnavailabilityResources(
  organizationSlug: string,
  activeOnly = false,
) {
  const context = await requireOrganizationRole(organizationSlug, ["admin", "coordinator"] as const);
  const supabase = await createClient();
  let query = supabase.from("technicians").select("id, name, active")
    .eq("organization_id", context.organization.id).order("name");
  if (activeOnly) query = query.eq("active", true);
  const { data, error } = await query;
  if (error) throw new Error("Não foi possível carregar os técnicos.");
  return data.map((item) => ({ id: item.id, label: item.name, active: item.active }));
}
