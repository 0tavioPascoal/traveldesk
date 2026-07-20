import "server-only";

import { serializeTechnicianSkills } from "@/features/technicians/application/replace-technician-skills";
import type { TechnicianFormInput } from "@/features/technicians/schemas/technician-schema";
import type { TechnicianMutationResult } from "@/features/technicians/types/technician";
import { requireOrganizationRole } from "@/features/organizations/application/require-organization-role";
import { createClient } from "@/lib/supabase/server";

const roles = ["admin", "coordinator"] as const;

function reasonFromError(code: string, message: string): Exclude<TechnicianMutationResult, { success: true }>["reason"] {
  if (code === "23505" && message.includes("document")) return "duplicate_document";
  if (code === "23505" && message.includes("email")) return "duplicate_email";
  if (message.includes("skill_") || message.includes("technician_skills")) return "invalid_skills";
  return "unexpected";
}

export async function createTechnician(
  organizationSlug: string,
  input: TechnicianFormInput,
): Promise<TechnicianMutationResult> {
  const context = await requireOrganizationRole(organizationSlug, roles);
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("create_technician_with_skills", {
    p_organization_id: context.organization.id,
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
  if (error) return { success: false, reason: reasonFromError(error.code, error.message) };
  return { success: true, technicianId: data };
}
