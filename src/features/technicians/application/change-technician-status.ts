import "server-only";

import type { TechnicianMutationResult } from "@/features/technicians/types/technician";
import { requireOrganizationRole } from "@/features/organizations/application/require-organization-role";
import { createClient } from "@/lib/supabase/server";

export async function changeTechnicianStatus(
  organizationSlug: string,
  technicianId: string,
  active: boolean,
): Promise<TechnicianMutationResult> {
  const context = await requireOrganizationRole(organizationSlug, ["admin", "coordinator"] as const);
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("technicians")
    .update({ active, updated_by: context.membership.profileId })
    .eq("organization_id", context.organization.id)
    .eq("id", technicianId)
    .select("id")
    .maybeSingle();
  if (error) return { success: false, reason: "unexpected" };
  return data
    ? { success: true, technicianId: data.id }
    : { success: false, reason: "not_found" };
}
