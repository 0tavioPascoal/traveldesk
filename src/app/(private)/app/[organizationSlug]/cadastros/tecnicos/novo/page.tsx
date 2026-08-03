import { FormPageContainer } from "@/components/page/page-container";
import { PageHeader } from "@/components/page/page-header";
import { TechnicianForm } from "@/features/technicians/components/technician-form";
import { requireOrganizationRole } from "@/features/organizations/application/require-organization-role";
import { listActiveSkills } from "@/features/skills/queries/list-active-skills";

export default async function NewTechnicianPage({ params }: { params: Promise<{ organizationSlug: string }> }) {
  const { organizationSlug } = await params;
  const context = await requireOrganizationRole(organizationSlug, ["admin", "coordinator"] as const);
  const skills = await listActiveSkills(organizationSlug);
  return <FormPageContainer><PageHeader title="Novo técnico" description="Cadastre os dados operacionais, a habilitação e as especialidades." breadcrumbs={[{ label: "Visão geral", href: `/app/${organizationSlug}/dashboard` }, { label: "Técnicos", href: `/app/${organizationSlug}/cadastros/tecnicos` }, { label: "Novo técnico" }]} /><TechnicianForm organizationSlug={organizationSlug} timezone={context.organization.timezone} skillOptions={skills.map((skill) => ({ ...skill, active: true }))} initialValues={{ name: "", document: "", email: "", phone: "", jobTitle: "", baseCity: "", baseState: "", driverLicenseNumber: "", driverLicenseCategory: "", driverLicenseExpiresAt: "", canDriveCompanyVehicle: false, notes: "", skillAssignments: [] }} /></FormPageContainer>;
}
