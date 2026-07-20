import "server-only";

import type { TechnicianSkillAssignment } from "@/features/technicians/types/technician";
import { requireOrganizationRole } from "@/features/organizations/application/require-organization-role";
import { createClient } from "@/lib/supabase/server";

const roles = ["admin", "coordinator"] as const;

export async function listTechnicianSkills(
  organizationSlug: string,
  technicianIds: string[],
): Promise<Map<string, TechnicianSkillAssignment[]>> {
  const context = await requireOrganizationRole(organizationSlug, roles);
  const result = new Map<string, TechnicianSkillAssignment[]>();
  if (technicianIds.length === 0) return result;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("technician_skills")
    .select("technician_id, skill_id, proficiency_level, is_primary, skills(name, active)")
    .eq("organization_id", context.organization.id)
    .in("technician_id", technicianIds)
    .order("is_primary", { ascending: false });

  if (error) throw new Error("Não foi possível carregar as especialidades dos técnicos.");

  for (const assignment of data) {
    const values = result.get(assignment.technician_id) ?? [];
    values.push({
      skillId: assignment.skill_id,
      skillName: assignment.skills.name,
      skillActive: assignment.skills.active,
      proficiencyLevel: assignment.proficiency_level,
      isPrimary: assignment.is_primary,
    });
    result.set(assignment.technician_id, values);
  }
  return result;
}
