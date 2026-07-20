import type { Tables } from "@/lib/supabase/database.types";

export type TechnicianSkillAssignment = {
  skillId: string;
  skillName: string;
  skillActive: boolean;
  proficiencyLevel: number;
  isPrimary: boolean;
};

export type TechnicianListItem = Pick<
  Tables<"technicians">,
  | "id"
  | "name"
  | "job_title"
  | "base_city"
  | "base_state"
  | "can_drive_company_vehicle"
  | "driver_license_expires_at"
  | "active"
  | "updated_at"
> & { skills: TechnicianSkillAssignment[] };

export type TechnicianDetails = Pick<
  Tables<"technicians">,
  | "id"
  | "profile_id"
  | "name"
  | "document"
  | "email"
  | "phone"
  | "job_title"
  | "base_city"
  | "base_state"
  | "driver_license_number"
  | "driver_license_category"
  | "driver_license_expires_at"
  | "can_drive_company_vehicle"
  | "notes"
  | "active"
  | "updated_at"
> & { skills: TechnicianSkillAssignment[] };

export type TechnicianFormSkillValue = {
  skillId: string;
  proficiencyLevel: string;
  isPrimary: boolean;
};

export type TechnicianFormValues = {
  name: string;
  document: string;
  email: string;
  phone: string;
  jobTitle: string;
  baseCity: string;
  baseState: string;
  driverLicenseNumber: string;
  driverLicenseCategory: string;
  driverLicenseExpiresAt: string;
  canDriveCompanyVehicle: boolean;
  notes: string;
  skillAssignments: TechnicianFormSkillValue[];
};

export type TechnicianFieldErrors = Partial<
  Record<keyof TechnicianFormValues, string[]>
>;

export type TechnicianActionState = {
  status: "idle" | "error";
  fieldErrors: TechnicianFieldErrors;
  message: string | null;
  values: TechnicianFormValues;
};

export type TechnicianStatusActionState = {
  status: "idle" | "error" | "success";
  message: string | null;
};

export type TechnicianProfileActionState = TechnicianStatusActionState;

export type TechnicianMutationResult =
  | { success: true; technicianId: string }
  | {
      success: false;
      reason:
        | "duplicate_document"
        | "duplicate_email"
        | "invalid_skills"
        | "not_found"
        | "profile_not_eligible"
        | "unexpected";
    };

export type TechnicianFilters = {
  query: string;
  status: "all" | "active" | "inactive";
  skillId: string;
  canDrive: "all" | "yes" | "no";
  baseState: string;
};

export type ActiveTechnician = {
  id: string;
  name: string;
  baseCity: string;
  baseState: string;
  canDriveCompanyVehicle: boolean;
  skills: Array<{
    id: string;
    name: string;
    proficiencyLevel: number;
    isPrimary: boolean;
  }>;
};

export type EligibleProfile = {
  id: string;
  name: string | null;
  email: string | null;
};
