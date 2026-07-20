import "server-only";

import type { ActiveTechnician } from "@/features/technicians/types/technician";
import { requireOrganizationMember } from "@/features/organizations/application/require-organization-member";
import { createClient } from "@/lib/supabase/server";

export async function listActiveTechnicians(
  organizationSlug: string,
): Promise<ActiveTechnician[]> {
  const context = await requireOrganizationMember(organizationSlug);
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("technicians")
    .select("id, name, base_city, base_state, can_drive_company_vehicle, driver_license_expires_at, technician_skills(skill_id, proficiency_level, is_primary, skills(name, active))")
    .eq("organization_id", context.organization.id)
    .eq("active", true)
    .order("name");
  if (error) throw new Error("Não foi possível carregar os técnicos ativos.");
  const today = new Date().toISOString().slice(0, 10);
  return data.map((technician) => ({
    id: technician.id,
    name: technician.name,
    baseCity: technician.base_city,
    baseState: technician.base_state,
    canDriveCompanyVehicle:
      technician.can_drive_company_vehicle &&
      Boolean(technician.driver_license_expires_at && technician.driver_license_expires_at >= today),
    skills: technician.technician_skills
      .filter((assignment) => assignment.skills.active)
      .map((assignment) => ({
        id: assignment.skill_id,
        name: assignment.skills.name,
        proficiencyLevel: assignment.proficiency_level,
        isPrimary: assignment.is_primary,
      })),
  }));
}
