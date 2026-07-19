import "server-only";

import type { ClientUnitMutationResult } from "@/features/clients/types/client";
import { requireOrganizationRole } from "@/features/organizations/application/require-organization-role";
import { createClient } from "@/lib/supabase/server";

const administrativeRoles = ["admin", "coordinator"] as const;

export async function changeClientUnitStatus(
  organizationSlug: string,
  clientId: string,
  unitId: string,
  active: boolean,
): Promise<ClientUnitMutationResult> {
  const context = await requireOrganizationRole(
    organizationSlug,
    administrativeRoles,
  );
  const supabase = await createClient();

  if (active) {
    const { data: client, error: clientError } = await supabase
      .from("clients")
      .select("id, active")
      .eq("id", clientId)
      .eq("organization_id", context.organization.id)
      .maybeSingle();

    if (clientError) {
      return { success: false, reason: "unexpected" };
    }

    if (!client) {
      return { success: false, reason: "client_not_found" };
    }

    if (!client.active) {
      return { success: false, reason: "client_inactive" };
    }
  }

  const { data, error } = await supabase
    .from("client_units")
    .update({
      active,
      updated_by: context.membership.profileId,
    })
    .eq("id", unitId)
    .eq("client_id", clientId)
    .eq("organization_id", context.organization.id)
    .select("id")
    .maybeSingle();

  if (error) {
    return {
      success: false,
      reason: active && error.code === "42501"
        ? "client_inactive"
        : "unexpected",
    };
  }

  return data ? { success: true } : { success: false, reason: "not_found" };
}
