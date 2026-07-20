import "server-only";

import type { TechnicianMutationResult } from "@/features/technicians/types/technician";
import { requireOrganizationRole } from "@/features/organizations/application/require-organization-role";
import { createClient } from "@/lib/supabase/server";

export async function unlinkTechnicianProfile(
  organizationSlug: string,
  technicianId: string,
): Promise<TechnicianMutationResult> {
  const context = await requireOrganizationRole(organizationSlug, ["admin"] as const);
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("unlink_technician_profile", {
    p_organization_id: context.organization.id,
    p_technician_id: technicianId,
  });
  if (error) return { success: false, reason: "unexpected" };
  return data
    ? { success: true, technicianId }
    : { success: false, reason: "not_found" };
}
