import "server-only";

import type { TechnicianFormValues } from "@/features/technicians/types/technician";

export function readTechnicianFormValues(formData: FormData): TechnicianFormValues {
  const text = (name: string) => {
    const value = formData.get(name);
    return typeof value === "string" ? value : "";
  };
  const skillIds = formData.getAll("skillId").filter((value): value is string => typeof value === "string");
  const levels = formData.getAll("proficiencyLevel").filter((value): value is string => typeof value === "string");
  const primarySkillId = text("primarySkillId");
  return {
    name: text("name"), document: text("document"), email: text("email"), phone: text("phone"),
    jobTitle: text("jobTitle"), baseCity: text("baseCity"), baseState: text("baseState"),
    driverLicenseNumber: text("driverLicenseNumber"), driverLicenseCategory: text("driverLicenseCategory"),
    driverLicenseExpiresAt: text("driverLicenseExpiresAt"),
    canDriveCompanyVehicle: formData.get("canDriveCompanyVehicle") === "on",
    notes: text("notes"),
    skillAssignments: skillIds.map((skillId, index) => ({
      skillId,
      proficiencyLevel: levels[index] ?? "",
      isPrimary: primarySkillId === skillId,
    })),
  };
}
