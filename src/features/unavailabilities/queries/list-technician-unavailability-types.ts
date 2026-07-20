import "server-only";

import { requireOrganizationRole } from "@/features/organizations/application/require-organization-role";
import type { UnavailabilityTypeFilters, UnavailabilityTypeItem } from "@/features/unavailabilities/types/unavailability";
import { createClient } from "@/lib/supabase/server";

export async function listTechnicianUnavailabilityTypes(
  organizationSlug: string,
  filters: UnavailabilityTypeFilters,
): Promise<UnavailabilityTypeItem[]> {
  const context = await requireOrganizationRole(organizationSlug, ["admin", "coordinator"] as const);
  const supabase = await createClient();
  let query = supabase.from("technician_unavailability_types")
    .select("id, name, description, active, updated_at")
    .eq("organization_id", context.organization.id)
    .order("name");
  if (filters.query) query = query.ilike("name", `%${filters.query.replace(/[\\%_]/g, "\\$&")}%`);
  if (filters.status !== "all") query = query.eq("active", filters.status === "active");
  const { data, error } = await query;
  if (error) throw new Error("Não foi possível carregar os tipos de indisponibilidade.");
  return data;
}
