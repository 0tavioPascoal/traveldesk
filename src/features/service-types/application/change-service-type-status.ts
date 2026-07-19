import "server-only";

import { requireOrganizationRole } from "@/features/organizations/application/require-organization-role";
import type { ServiceTypeMutationResult } from "@/features/service-types/types/service-type";
import { createClient } from "@/lib/supabase/server";

const administrativeRoles = ["admin", "coordinator"] as const;

export async function changeServiceTypeStatus(
  organizationSlug: string,
  serviceTypeId: string,
  active: boolean,
): Promise<ServiceTypeMutationResult> {
  const context = await requireOrganizationRole(
    organizationSlug,
    administrativeRoles,
  );
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("service_types")
    .update({
      active,
      updated_by: context.membership.profileId,
    })
    .eq("id", serviceTypeId)
    .eq("organization_id", context.organization.id)
    .select("id")
    .maybeSingle();

  if (error) {
    return {
      success: false,
      reason: error.code === "23505" ? "duplicate_name" : "unexpected",
    };
  }

  return data ? { success: true } : { success: false, reason: "not_found" };
}
