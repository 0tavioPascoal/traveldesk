import "server-only";

import { requireOrganizationRole } from "@/features/organizations/application/require-organization-role";
import type { ServiceTypeFormInput } from "@/features/service-types/schemas/service-type-schema";
import type { ServiceTypeMutationResult } from "@/features/service-types/types/service-type";
import { createClient } from "@/lib/supabase/server";

const administrativeRoles = ["admin", "coordinator"] as const;

function escapeLikePattern(value: string) {
  return value.replace(/[\\%_]/g, "\\$&");
}

export async function updateServiceType(
  organizationSlug: string,
  serviceTypeId: string,
  input: ServiceTypeFormInput,
): Promise<ServiceTypeMutationResult> {
  const context = await requireOrganizationRole(
    organizationSlug,
    administrativeRoles,
  );
  const name = input.name.trim();
  const description = input.description?.trim() || null;
  const supabase = await createClient();
  const { data: duplicate, error: duplicateError } = await supabase
    .from("service_types")
    .select("id")
    .eq("organization_id", context.organization.id)
    .ilike("name", escapeLikePattern(name))
    .neq("id", serviceTypeId)
    .limit(1)
    .maybeSingle();

  if (duplicateError) {
    return { success: false, reason: "unexpected" };
  }

  if (duplicate) {
    return { success: false, reason: "duplicate_name" };
  }

  const { data, error } = await supabase
    .from("service_types")
    .update({
      name,
      description,
      active: input.active,
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
