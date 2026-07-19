import "server-only";

import { requireOrganizationRole } from "@/features/organizations/application/require-organization-role";
import type { SkillFormInput } from "@/features/skills/schemas/skill-schema";
import type { SkillMutationResult } from "@/features/skills/types/skill";
import { createClient } from "@/lib/supabase/server";

const administrativeRoles = ["admin", "coordinator"] as const;

function escapeLikePattern(value: string) {
  return value.replace(/[\\%_]/g, "\\$&");
}

export async function updateSkill(
  organizationSlug: string,
  skillId: string,
  input: SkillFormInput,
): Promise<SkillMutationResult> {
  const context = await requireOrganizationRole(
    organizationSlug,
    administrativeRoles,
  );
  const name = input.name.trim();
  const description = input.description?.trim() || null;
  const supabase = await createClient();
  const { data: duplicate, error: duplicateError } = await supabase
    .from("skills")
    .select("id")
    .eq("organization_id", context.organization.id)
    .ilike("name", escapeLikePattern(name))
    .neq("id", skillId)
    .limit(1)
    .maybeSingle();

  if (duplicateError) {
    return { success: false, reason: "unexpected" };
  }

  if (duplicate) {
    return { success: false, reason: "duplicate_name" };
  }

  const { data, error } = await supabase
    .from("skills")
    .update({
      name,
      description,
      active: input.active,
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
