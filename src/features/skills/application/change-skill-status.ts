import "server-only";

import { requireOrganizationRole } from "@/features/organizations/application/require-organization-role";
import type { SkillMutationResult } from "@/features/skills/types/skill";
import { createClient } from "@/lib/supabase/server";

const administrativeRoles = ["admin", "coordinator"] as const;

export async function changeSkillStatus(
  organizationSlug: string,
  skillId: string,
  active: boolean,
): Promise<SkillMutationResult> {
  const context = await requireOrganizationRole(
    organizationSlug,
    administrativeRoles,
  );
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("skills")
    .update({
      active,
      updated_by: context.membership.profileId,
    })
    .eq("id", skillId)
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
