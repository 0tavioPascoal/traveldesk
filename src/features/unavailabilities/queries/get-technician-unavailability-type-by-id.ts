import "server-only";

import { requireOrganizationRole } from "@/features/organizations/application/require-organization-role";
import type { UnavailabilityTypeItem } from "@/features/unavailabilities/types/unavailability";
import { createClient } from "@/lib/supabase/server";

export async function getTechnicianUnavailabilityTypeById(
  organizationSlug: string,
  id: string,
): Promise<UnavailabilityTypeItem | null> {
  const context = await requireOrganizationRole(organizationSlug, ["admin", "coordinator"] as const);
  const supabase = await createClient();
  const { data, error } = await supabase.from("technician_unavailability_types")
    .select("id, name, description, active, updated_at")
    .eq("organization_id", context.organization.id).eq("id", id).maybeSingle();
  if (error) throw new Error("Não foi possível carregar o tipo de indisponibilidade.");
  return data;
}
