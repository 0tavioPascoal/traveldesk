import "server-only";

import type { TripRequiredSkill, TripSkillCoverage, TripTechnician } from "@/features/trips/types/trip-staffing";

export function evaluateTripSkillCoverage(
  requirements: TripRequiredSkill[],
  technicians: TripTechnician[],
): TripSkillCoverage {
  const items = requirements.map((requirement) => {
    const coveredBy = technicians
      .filter((technician) => technician.active && technician.skills.some(
        (skill) => skill.skillId === requirement.skillId
          && skill.proficiencyLevel >= requirement.minimumProficiencyLevel,
      ))
      .map((technician) => ({ technicianId: technician.technicianId, technicianName: technician.name }));
    return { ...requirement, covered: coveredBy.length > 0, coveredBy };
  });
  const coveredCount = items.filter((item) => item.covered).length;
  return {
    complete: coveredCount === items.length,
    coveredCount,
    totalCount: items.length,
    requirements: items,
  };
}
