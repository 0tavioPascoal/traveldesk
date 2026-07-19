import "server-only";

import type { ClientMutationResult } from "@/features/clients/types/client";
import { requireOrganizationRole } from "@/features/organizations/application/require-organization-role";
import { createClient } from "@/lib/supabase/server";

const administrativeRoles = ["admin", "coordinator"] as const;

export async function changeClientStatus(
  organizationSlug: string,
  clientId: string,
  active: boolean,
): Promise<ClientMutationResult> {
  const context = await requireOrganizationRole(
    organizationSlug,
    administrativeRoles,
  );
  const supabase = await createClient();

  if (!active) {
    const { data: activeUnit, error: unitError } = await supabase
      .from("client_units")
      .select("id")
      .eq("organization_id", context.organization.id)
      .eq("client_id", clientId)
      .eq("active", true)
      .limit(1)
      .maybeSingle();

    if (unitError) {
      return { success: false, reason: "unexpected" };
    }

    if (activeUnit) {
      return { success: false, reason: "active_units_exist" };
    }
  }

  const { data, error } = await supabase
    .from("clients")
    .update({
      active,
      updated_by: context.membership.profileId,
    })
    .eq("id", clientId)
    .eq("organization_id", context.organization.id)
    .select("id")
    .maybeSingle();

  if (error) {
    return {
      success: false,
      reason: !active && error.code === "42501"
        ? "active_units_exist"
        : "unexpected",
    };
  }

  return data
    ? { success: true, clientId: data.id }
    : { success: false, reason: "not_found" };
}
