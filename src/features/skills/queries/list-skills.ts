import "server-only";

import { requireOrganizationRole } from "@/features/organizations/application/require-organization-role";
import type { Skill, SkillFilters } from "@/features/skills/types/skill";
import { createClient } from "@/lib/supabase/server";

const administrativeRoles = ["admin", "coordinator"] as const;

function escapeLikePattern(value: string) {
  return value.replace(/[\\%_]/g, "\\$&");
}

export async function listSkills(
  organizationSlug: string,
  filters: SkillFilters,
): Promise<Skill[]> {
  const context = await requireOrganizationRole(
    organizationSlug,
    administrativeRoles,
  );
  const supabase = await createClient();
  let query = supabase
    .from("skills")
    .select("id, name, description, active, updated_at")
    .eq("organization_id", context.organization.id)
    .order("name", { ascending: true });

  if (filters.query) {
    query = query.ilike("name", `%${escapeLikePattern(filters.query)}%`);
  }

  if (filters.status !== "all") {
    query = query.eq("active", filters.status === "active");
  }

  const { data, error } = await query;

  if (error) {
    throw new Error("Não foi possível carregar as especialidades.");
  }

  return data;
}
