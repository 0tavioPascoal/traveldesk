export type TripRequiredSkill = {
  id: string;
  skillId: string;
  skillName: string;
  skillActive: boolean;
  minimumProficiencyLevel: number;
  notes: string | null;
};

export type TripTechnicianSkill = {
  skillId: string;
  skillName: string;
  skillActive: boolean;
  proficiencyLevel: number;
  isPrimary: boolean;
};

export type TripTechnician = {
  id: string;
  technicianId: string;
  name: string;
  active: boolean;
  baseCity: string;
  baseState: string;
  isResponsible: boolean;
  notes: string | null;
  skills: TripTechnicianSkill[];
};

export type TripSkillCoverageItem = TripRequiredSkill & {
  covered: boolean;
  coveredBy: Array<{ technicianId: string; technicianName: string }>;
};

export type TripSkillCoverage = {
  complete: boolean;
  coveredCount: number;
  totalCount: number;
  requirements: TripSkillCoverageItem[];
};

export type TripTeamSummary = {
  requirements: TripRequiredSkill[];
  technicians: TripTechnician[];
  coverage: TripSkillCoverage;
};

export type TechnicianAvailabilityReason = "unavailability" | "trip_conflict";
export type TripTechnicianCandidate = {
  id: string;
  name: string;
  baseCity: string;
  baseState: string;
  skills: TripTechnicianSkill[];
  group: "recommended" | "available" | "unavailable";
  unavailableReason: TechnicianAvailabilityReason | null;
  coveredRequirementCount: number;
};

export type TripTechnicianCandidates = {
  periodRequired: boolean;
  items: TripTechnicianCandidate[];
};

export type TripRequiredSkillFormValue = {
  skillId: string;
  minimumProficiencyLevel: number;
  notes: string;
};
export type TripTechnicianFormValue = {
  technicianId: string;
  isResponsible: boolean;
  notes: string;
};

export type TripStaffingActionState = {
  status: "idle" | "success" | "error";
  message: string | null;
};

export type TripStaffingMutationResult =
  | { success: true }
  | {
      success: false;
      reason:
        | "not_editable"
        | "period_required"
        | "skill_not_available"
        | "technician_not_available"
        | "technician_unavailable"
        | "schedule_conflict"
        | "invalid_requirements"
        | "invalid_team"
        | "responsible_not_allocated"
        | "driver_assigned"
        | "vehicle_capacity_exceeded"
        | "unexpected";
    };
