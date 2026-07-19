import "server-only";

import { requireOrganizationRole } from "@/features/organizations/application/require-organization-role";
import type { SkillFormInput } from "@/features/skills/schemas/skill-schema";
import type { SkillMutationResult } from "@/features/skills/types/skill";
import { createClient } from "@/lib/supabase/server";

const administrativeRoles = ["admin", "coordinator"] as const;

function escapeLikePattern(value: string) {
  return value.replace(/[\\%_]/g, "\\$&");
}

export async function createSkill(
  organizationSlug: string,
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
    .limit(1)
    .maybeSingle();

  if (duplicateError) {
    return { success: false, reason: "unexpected" };
  }

  if (duplicate) {
    return { success: false, reason: "duplicate_name" };
  }

  const { error } = await supabase.from("skills").insert({
    organization_id: context.organization.id,
    name,
    description,
    active: input.active,
    created_by: context.membership.profileId,
    updated_by: context.membership.profileId,
  });

  if (!error) {
    return { success: true };
  }

  return {
    success: false,
    reason: error.code === "23505" ? "duplicate_name" : "unexpected",
  };
}
