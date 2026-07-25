import "server-only";

import { requireOrganizationRole } from "@/features/organizations/application/require-organization-role";
import type { TripTechnicianCandidates } from "@/features/trips/types/trip-staffing";
import { createClient } from "@/lib/supabase/server";

export async function listAvailableTechniciansForTrip(
  organizationSlug: string,
  tripId: string,
): Promise<TripTechnicianCandidates> {
  const context = await requireOrganizationRole(organizationSlug, ["admin", "coordinator"] as const);
  const supabase = await createClient();
  const tripResult = await supabase.from("trips")
    .select("travel_starts_at, travel_ends_at")
    .eq("organization_id", context.organization.id).eq("id", tripId).maybeSingle();
  if (tripResult.error) throw new Error("Não foi possível verificar o período da viagem.");
  if (!tripResult.data?.travel_starts_at || !tripResult.data.travel_ends_at) {
    return { periodRequired: true, items: [] };
  }
  const startsAt = tripResult.data.travel_starts_at;
  const endsAt = tripResult.data.travel_ends_at;
  const [techniciansResult, requirementsResult, allocationsResult, unavailabilitiesResult, conflictsResult] = await Promise.all([
    supabase.from("technicians")
      .select("id, name, base_city, base_state, technician_skills(skill_id, proficiency_level, is_primary, skills(name, active))")
      .eq("organization_id", context.organization.id).eq("active", true).order("name"),
    supabase.from("trip_required_skills").select("skill_id, minimum_proficiency_level")
      .eq("organization_id", context.organization.id).eq("trip_id", tripId),
    supabase.from("trip_technicians").select("technician_id, technicians(active, technician_skills(skill_id, proficiency_level))")
      .eq("organization_id", context.organization.id).eq("trip_id", tripId),
    supabase.from("technician_unavailabilities").select("technician_id")
      .eq("organization_id", context.organization.id).eq("active", true)
      .lt("starts_at", endsAt).gt("ends_at", startsAt),
    supabase.from("trip_technicians").select("technician_id")
      .eq("organization_id", context.organization.id).eq("blocks_schedule", true)
      .neq("trip_id", tripId).lt("occupancy_starts_at", endsAt).gt("occupancy_ends_at", startsAt),
  ]);
  if (techniciansResult.error || requirementsResult.error || allocationsResult.error
    || unavailabilitiesResult.error || conflictsResult.error) {
    throw new Error("Não foi possível carregar a disponibilidade dos técnicos.");
  }
  const allocated = new Set(allocationsResult.data.map((item) => item.technician_id));
  const unmetRequirements = requirementsResult.data.filter((requirement) => !allocationsResult.data.some(
    (allocation) => allocation.technicians.active && allocation.technicians.technician_skills.some(
      (skill) => skill.skill_id === requirement.skill_id
        && skill.proficiency_level >= requirement.minimum_proficiency_level,
    ),
  ));
  const unavailable = new Set(unavailabilitiesResult.data.map((item) => item.technician_id));
  const conflicts = new Set(conflictsResult.data.map((item) => item.technician_id));
  const items = techniciansResult.data.map((technician) => {
    const skills = technician.technician_skills.map((skill) => ({
      skillId: skill.skill_id,
      skillName: skill.skills.name,
      skillActive: skill.skills.active,
      proficiencyLevel: skill.proficiency_level,
      isPrimary: skill.is_primary,
    }));
    const coveredRequirementCount = unmetRequirements.filter((requirement) =>
      skills.some((skill) => skill.skillId === requirement.skill_id
        && skill.proficiencyLevel >= requirement.minimum_proficiency_level),
    ).length;
    const unavailableReason = unavailable.has(technician.id)
      ? "unavailability" as const
      : conflicts.has(technician.id) ? "trip_conflict" as const : null;
    return {
      id: technician.id,
      name: technician.name,
      baseCity: technician.base_city,
      baseState: technician.base_state,
      skills,
      group: unavailableReason
        ? "unavailable" as const
        : coveredRequirementCount > 0 ? "recommended" as const : "available" as const,
      unavailableReason,
      coveredRequirementCount,
      alreadyAllocated: allocated.has(technician.id),
    };
  }).sort((left, right) => {
    const order = { recommended: 0, available: 1, unavailable: 2 };
    return order[left.group] - order[right.group]
      || right.coveredRequirementCount - left.coveredRequirementCount
      || left.name.localeCompare(right.name, "pt-BR");
  });
  return { periodRequired: false, items };
}
