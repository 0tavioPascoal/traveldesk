import "server-only";

import { requireOrganizationRole } from "@/features/organizations/application/require-organization-role";
import { skillIdSchema } from "@/features/skills/schemas/skill-schema";
import type { Skill } from "@/features/skills/types/skill";
import { createClient } from "@/lib/supabase/server";

const administrativeRoles = ["admin", "coordinator"] as const;

export async function getSkillById(
  organizationSlug: string,
  skillId: string,
): Promise<Skill | null> {
  const parsedId = skillIdSchema.safeParse(skillId);

  if (!parsedId.success) {
    return null;
  }

  const context = await requireOrganizationRole(
    organizationSlug,
    administrativeRoles,
  );
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("skills")
    .select("id, name, description, active, updated_at")
    .eq("id", parsedId.data)
    .eq("organization_id", context.organization.id)
    .maybeSingle();

  if (error) {
    throw new Error("Não foi possível carregar a especialidade.");
  }

  return data;
}
