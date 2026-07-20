import Link from "next/link";
import { TechnicianForm } from "@/features/technicians/components/technician-form";
import { requireOrganizationRole } from "@/features/organizations/application/require-organization-role";
import { listActiveSkills } from "@/features/skills/queries/list-active-skills";

export default async function NewTechnicianPage({ params }: { params: Promise<{ organizationSlug: string }> }) {
  const { organizationSlug } = await params;
  await requireOrganizationRole(organizationSlug, ["admin", "coordinator"] as const);
  const skills = await listActiveSkills(organizationSlug);
  return <main className="min-h-screen bg-zinc-100 px-4 py-8 sm:px-6"><div className="mx-auto max-w-4xl"><Link href={`/app/${organizationSlug}/cadastros/tecnicos`} className="text-sm font-medium text-zinc-600">← Voltar aos técnicos</Link><div className="mt-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm"><h1 className="text-2xl font-bold">Novo técnico</h1><p className="mt-1 text-sm text-zinc-600">Cadastre os dados operacionais e as especialidades.</p><div className="mt-6"><TechnicianForm organizationSlug={organizationSlug} skillOptions={skills.map((skill) => ({ ...skill, active: true }))} initialValues={{ name: "", document: "", email: "", phone: "", jobTitle: "", baseCity: "", baseState: "", driverLicenseNumber: "", driverLicenseCategory: "", driverLicenseExpiresAt: "", canDriveCompanyVehicle: false, notes: "", skillAssignments: [] }} /></div></div></div></main>;
}
