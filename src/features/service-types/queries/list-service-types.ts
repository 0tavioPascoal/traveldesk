import "server-only";

import { requireOrganizationRole } from "@/features/organizations/application/require-organization-role";
import type {
  ServiceType,
  ServiceTypeFilters,
} from "@/features/service-types/types/service-type";
import { createClient } from "@/lib/supabase/server";

const administrativeRoles = ["admin", "coordinator"] as const;

function escapeLikePattern(value: string) {
  return value.replace(/[\\%_]/g, "\\$&");
}

export async function listServiceTypes(
  organizationSlug: string,
  filters: ServiceTypeFilters,
): Promise<ServiceType[]> {
  const context = await requireOrganizationRole(
    organizationSlug,
    administrativeRoles,
  );
  const supabase = await createClient();
  let query = supabase
    .from("service_types")
    .select("id, name, description, active, updated_at")
    .eq("organization_id", context.organization.id)
    .order("name", { ascending: true });

  if (filters.query) {
    query = query.ilike("name", `%${escapeLikePattern(filters.query)}%`);
  }

  if (filters.status !== "all") {
    query = query.eq("active", filters.status === "active");
  }

  const { data, error } = await query;

  if (error) {
    throw new Error("Não foi possível carregar os tipos de atendimento.");
  }

  return data;
}
