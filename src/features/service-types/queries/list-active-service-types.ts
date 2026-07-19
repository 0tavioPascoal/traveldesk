import "server-only";

import { requireOrganizationMember } from "@/features/organizations/application/require-organization-member";
import type { ActiveServiceType } from "@/features/service-types/types/service-type";
import { createClient } from "@/lib/supabase/server";

export async function listActiveServiceTypes(
  organizationSlug: string,
): Promise<ActiveServiceType[]> {
  const context = await requireOrganizationMember(organizationSlug);
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("service_types")
    .select("id, name")
    .eq("organization_id", context.organization.id)
    .eq("active", true)
    .order("name", { ascending: true });

  if (error) {
    throw new Error("Não foi possível carregar os tipos de atendimento ativos.");
  }

  return data;
}
