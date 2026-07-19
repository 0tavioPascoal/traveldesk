import "server-only";

import { requireOrganizationMember } from "@/features/organizations/application/require-organization-member";
import type { ActiveSkill } from "@/features/skills/types/skill";
import { createClient } from "@/lib/supabase/server";

export async function listActiveSkills(
  organizationSlug: string,
): Promise<ActiveSkill[]> {
  const context = await requireOrganizationMember(organizationSlug);
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("skills")
    .select("id, name")
    .eq("organization_id", context.organization.id)
    .eq("active", true)
    .order("name", { ascending: true });

  if (error) {
    throw new Error("Não foi possível carregar as especialidades ativas.");
  }

  return data;
}
