import "server-only";

import { digitsOnly } from "@/features/technicians/schemas/technician-schema";
import type { TechnicianFilters, TechnicianListItem } from "@/features/technicians/types/technician";
import { listTechnicianSkills } from "@/features/technicians/queries/list-technician-skills";
import { requireOrganizationRole } from "@/features/organizations/application/require-organization-role";
import { createClient } from "@/lib/supabase/server";

const roles = ["admin", "coordinator"] as const;

function quoted(value: string) {
  return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

function escaped(value: string) {
  return value.replace(/[\\%_]/g, "\\$&");
}

export async function listTechnicians(
  organizationSlug: string,
  filters: TechnicianFilters,
): Promise<TechnicianListItem[]> {
  const context = await requireOrganizationRole(organizationSlug, roles);
  const supabase = await createClient();
  let allowedIds: string[] | null = null;

  if (filters.skillId) {
    const { data, error } = await supabase
      .from("technician_skills")
      .select("technician_id")
      .eq("organization_id", context.organization.id)
      .eq("skill_id", filters.skillId);
    if (error) throw new Error("Não foi possível filtrar os técnicos.");
    allowedIds = data.map((item) => item.technician_id);
    if (allowedIds.length === 0) return [];
  }

  let query = supabase
    .from("technicians")
    .select("id, name, job_title, base_city, base_state, can_drive_company_vehicle, driver_license_expires_at, active, updated_at")
    .eq("organization_id", context.organization.id)
    .order("name");

  if (allowedIds) query = query.in("id", allowedIds);
  if (filters.status !== "all") query = query.eq("active", filters.status === "active");
  if (filters.canDrive !== "all") query = query.eq("can_drive_company_vehicle", filters.canDrive === "yes");
  if (filters.baseState) query = query.eq("base_state", filters.baseState);
  if (filters.query) {
    const pattern = `%${escaped(filters.query)}%`;
    const clauses = ["name", "email", "phone", "base_city"].map(
      (field) => `${field}.ilike.${quoted(pattern)}`,
    );
    const document = digitsOnly(filters.query);
    if (document) clauses.push(`document.ilike.${quoted(`%${document}%`)}`);
    query = query.or(clauses.join(","));
  }

  const { data, error } = await query;
  if (error) throw new Error("Não foi possível carregar os técnicos.");
  const skills = await listTechnicianSkills(organizationSlug, data.map((item) => item.id));
  return data.map((technician) => ({ ...technician, skills: skills.get(technician.id) ?? [] }));
}
