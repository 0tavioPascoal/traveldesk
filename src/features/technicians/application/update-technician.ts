import "server-only";

import { serializeTechnicianSkills } from "@/features/technicians/application/replace-technician-skills";
import type { TechnicianFormInput } from "@/features/technicians/schemas/technician-schema";
import type { TechnicianMutationResult } from "@/features/technicians/types/technician";
import { requireOrganizationRole } from "@/features/organizations/application/require-organization-role";
import { createClient } from "@/lib/supabase/server";

const roles = ["admin", "coordinator"] as const;

export async function updateTechnician(
  organizationSlug: string,
  technicianId: string,
  input: TechnicianFormInput,
): Promise<TechnicianMutationResult> {
  const context = await requireOrganizationRole(organizationSlug, roles);
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("update_technician_with_skills", {
    p_organization_id: context.organization.id,
    p_technician_id: technicianId,
    p_name: input.name,
    p_document: input.document,
    p_email: input.email,
    p_phone: input.phone,
    p_job_title: input.jobTitle,
    p_base_city: input.baseCity,
    p_base_state: input.baseState,
    p_driver_license_number: input.driverLicenseNumber,
    p_driver_license_category: input.driverLicenseCategory,
    p_driver_license_expires_at: input.driverLicenseExpiresAt,
    p_can_drive_company_vehicle: input.canDriveCompanyVehicle,
    p_notes: input.notes,
    p_skills: serializeTechnicianSkills(input.skillAssignments),
  });
  if (error) {
    if (error.code === "23505" && error.message.includes("document")) return { success: false, reason: "duplicate_document" };
    if (error.code === "23505" && error.message.includes("email")) return { success: false, reason: "duplicate_email" };
    if (error.message.includes("skill_") || error.message.includes("technician_skills")) return { success: false, reason: "invalid_skills" };
    return { success: false, reason: "unexpected" };
  }
  return data
    ? { success: true, technicianId }
    : { success: false, reason: "not_found" };
}
