import "server-only";

import { notFound } from "next/navigation";

import { listTechnicianSkills } from "@/features/technicians/queries/list-technician-skills";
import type { TechnicianDetails } from "@/features/technicians/types/technician";
import { requireOrganizationRole } from "@/features/organizations/application/require-organization-role";
import { createClient } from "@/lib/supabase/server";

const roles = ["admin", "coordinator"] as const;

export async function getTechnicianById(
  organizationSlug: string,
  technicianId: string,
): Promise<TechnicianDetails> {
  const context = await requireOrganizationRole(organizationSlug, roles);
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("technicians")
    .select("id, profile_id, name, document, email, phone, job_title, base_city, base_state, driver_license_number, driver_license_category, driver_license_expires_at, can_drive_company_vehicle, notes, active, updated_at")
    .eq("organization_id", context.organization.id)
    .eq("id", technicianId)
    .maybeSingle();
  if (error) throw new Error("Não foi possível carregar o técnico.");
  if (!data) notFound();
  const assignments = await listTechnicianSkills(organizationSlug, [technicianId]);
  return { ...data, skills: assignments.get(technicianId) ?? [] };
}
