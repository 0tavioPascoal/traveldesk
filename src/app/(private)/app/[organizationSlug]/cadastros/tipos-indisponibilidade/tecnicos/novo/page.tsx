import { PageContainer } from "@/components/page/page-container";
import { PageHeader } from "@/components/page/page-header";
import { requireOrganizationRole } from "@/features/organizations/application/require-organization-role";
import { UnavailabilityTypeForm } from "@/features/unavailabilities/components/unavailability-type-form";

export default async function NewTechnicianUnavailabilityTypePage({ params }: { params: Promise<{ organizationSlug: string }> }) {
  const { organizationSlug } = await params;
  await requireOrganizationRole(organizationSlug, ["admin", "coordinator"] as const);
  const path = `/app/${organizationSlug}/cadastros/tipos-indisponibilidade/tecnicos`;
  return <PageContainer className="max-w-3xl space-y-6"><PageHeader title="Novo tipo para técnico" description="Cadastre um motivo utilizado nas indisponibilidades de técnicos." breadcrumbs={[{ label: "Visão geral", href: `/app/${organizationSlug}/dashboard` }, { label: "Tipos de indisponibilidade", href: path }, { label: "Novo tipo para técnico" }]} /><section className="rounded-2xl border border-border bg-card p-5 sm:p-6"><UnavailabilityTypeForm organizationSlug={organizationSlug} resource="technicians" initialValues={{ name: "", description: "", active: true }} /></section></PageContainer>;
}
