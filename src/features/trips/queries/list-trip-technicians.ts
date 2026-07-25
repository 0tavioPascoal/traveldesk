import "server-only";

import { requireOrganizationRole } from "@/features/organizations/application/require-organization-role";
import type { TripTechnician } from "@/features/trips/types/trip-staffing";
import { createClient } from "@/lib/supabase/server";

export async function listTripTechnicians(
  organizationSlug: string,
  tripId: string,
): Promise<TripTechnician[]> {
  const context = await requireOrganizationRole(organizationSlug, ["admin", "coordinator"] as const);
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("trip_technicians")
    .select("id, technician_id, is_responsible, notes, technicians(name, active, base_city, base_state, technician_skills(skill_id, proficiency_level, is_primary, skills(name, active)))")
    .eq("organization_id", context.organization.id)
    .eq("trip_id", tripId)
    .order("is_responsible", { ascending: false });
  if (error) throw new Error("Não foi possível carregar a equipe técnica.");
  return data.map((item) => ({
    id: item.id,
    technicianId: item.technician_id,
    name: item.technicians.name,
    active: item.technicians.active,
    baseCity: item.technicians.base_city,
    baseState: item.technicians.base_state,
    isResponsible: item.is_responsible,
    notes: item.notes,
    skills: item.technicians.technician_skills.map((skill) => ({
      skillId: skill.skill_id,
      skillName: skill.skills.name,
      skillActive: skill.skills.active,
      proficiencyLevel: skill.proficiency_level,
      isPrimary: skill.is_primary,
    })),
  }));
}
