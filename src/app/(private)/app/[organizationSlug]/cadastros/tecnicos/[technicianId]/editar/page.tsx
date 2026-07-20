import Link from "next/link";
import { TechnicianForm } from "@/features/technicians/components/technician-form";
import { getTechnicianById } from "@/features/technicians/queries/get-technician-by-id";
import { requireOrganizationRole } from "@/features/organizations/application/require-organization-role";
import { listActiveSkills } from "@/features/skills/queries/list-active-skills";

export default async function EditTechnicianPage({ params }: { params: Promise<{ organizationSlug: string; technicianId: string }> }) {
  const { organizationSlug, technicianId } = await params;
  await requireOrganizationRole(organizationSlug, ["admin", "coordinator"] as const);
  const [technician, activeSkills] = await Promise.all([getTechnicianById(organizationSlug, technicianId), listActiveSkills(organizationSlug)]);
  const optionMap = new Map(activeSkills.map((skill) => [skill.id, { ...skill, active: true }]));
  for (const assignment of technician.skills) if (!optionMap.has(assignment.skillId)) optionMap.set(assignment.skillId, { id: assignment.skillId, name: assignment.skillName, active: assignment.skillActive });
  return <main className="min-h-screen bg-zinc-100 px-4 py-8 sm:px-6"><div className="mx-auto max-w-4xl"><Link href={`/app/${organizationSlug}/cadastros/tecnicos/${technicianId}`} className="text-sm font-medium text-zinc-600">← Voltar ao técnico</Link><div className="mt-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm"><h1 className="text-2xl font-bold">Editar técnico</h1><div className="mt-6"><TechnicianForm organizationSlug={organizationSlug} technicianId={technicianId} skillOptions={[...optionMap.values()]} initialValues={{ name: technician.name, document: technician.document ?? "", email: technician.email ?? "", phone: technician.phone ?? "", jobTitle: technician.job_title ?? "", baseCity: technician.base_city, baseState: technician.base_state, driverLicenseNumber: technician.driver_license_number ?? "", driverLicenseCategory: technician.driver_license_category ?? "", driverLicenseExpiresAt: technician.driver_license_expires_at ?? "", canDriveCompanyVehicle: technician.can_drive_company_vehicle, notes: technician.notes ?? "", skillAssignments: technician.skills.map((skill) => ({ skillId: skill.skillId, proficiencyLevel: String(skill.proficiencyLevel), isPrimary: skill.isPrimary })) }} /></div></div></div></main>;
}
