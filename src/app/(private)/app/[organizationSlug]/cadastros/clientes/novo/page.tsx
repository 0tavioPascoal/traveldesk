import { PageContainer } from "@/components/page/page-container";
import { PageHeader } from "@/components/page/page-header";
import { ClientForm } from "@/features/clients/components/client-form";
import { requireOrganizationRole } from "@/features/organizations/application/require-organization-role";

type NewClientPageProps = { params: Promise<{ organizationSlug: string }> };
const administrativeRoles = ["admin", "coordinator"] as const;

export default async function NewClientPage({ params }: NewClientPageProps) {
  const { organizationSlug } = await params;
  const context = await requireOrganizationRole(organizationSlug, administrativeRoles);
  const listPath = `/app/${organizationSlug}/cadastros/clientes`;

  return (
    <PageContainer className="max-w-5xl space-y-6">
      <PageHeader title="Novo cliente" description="Cadastre os dados principais para organizar as futuras unidades de atendimento." eyebrow={context.organization.name} breadcrumbs={[{ label: "Visão geral", href: `/app/${organizationSlug}/dashboard` }, { label: "Cadastros" }, { label: "Clientes", href: listPath }, { label: "Novo cliente" }]} />
      <ClientForm organizationSlug={organizationSlug} initialValues={{ legalName: "", tradeName: "", taxId: "", segment: "", notes: "" }} />
    </PageContainer>
  );
}
