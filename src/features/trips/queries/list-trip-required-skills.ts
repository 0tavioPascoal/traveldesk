import "server-only";

import { requireOrganizationRole } from "@/features/organizations/application/require-organization-role";
import type { TripRequiredSkill } from "@/features/trips/types/trip-staffing";
import { createClient } from "@/lib/supabase/server";

export async function listTripRequiredSkills(
  organizationSlug: string,
  tripId: string,
): Promise<TripRequiredSkill[]> {
  const context = await requireOrganizationRole(organizationSlug, ["admin", "coordinator"] as const);
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("trip_required_skills")
    .select("id, skill_id, minimum_proficiency_level, notes, skills(name, active)")
    .eq("organization_id", context.organization.id)
    .eq("trip_id", tripId)
    .order("created_at");
  if (error) throw new Error("Não foi possível carregar os requisitos técnicos.");
  return data.map((item) => ({
    id: item.id,
    skillId: item.skill_id,
    skillName: item.skills.name,
    skillActive: item.skills.active,
    minimumProficiencyLevel: item.minimum_proficiency_level,
    notes: item.notes,
  }));
}
