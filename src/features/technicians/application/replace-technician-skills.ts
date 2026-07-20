import "server-only";

import type { TechnicianFormInput } from "@/features/technicians/schemas/technician-schema";
import type { Json } from "@/lib/supabase/database.types";

export function serializeTechnicianSkills(
  assignments: TechnicianFormInput["skillAssignments"],
): Json {
  return assignments.map((assignment) => ({
    skill_id: assignment.skillId,
    proficiency_level: assignment.proficiencyLevel,
    is_primary: assignment.isPrimary,
  }));
}
