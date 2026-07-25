import { PageContainer } from "@/components/page/page-container";
import { PageHeader } from "@/components/page/page-header";
import { requireOrganizationRole } from "@/features/organizations/application/require-organization-role";
import { ServiceTypeForm } from "@/features/service-types/components/service-type-form";

type NewServiceTypePageProps = {
  params: Promise<{ organizationSlug: string }>;
};

const administrativeRoles = ["admin", "coordinator"] as const;

export default async function NewServiceTypePage({
  params,
}: NewServiceTypePageProps) {
  const { organizationSlug } = await params;
  await requireOrganizationRole(
    organizationSlug,
    administrativeRoles,
  );
  const listPath = `/app/${organizationSlug}/cadastros/tipos-atendimento`;

  return (
    <PageContainer className="max-w-3xl space-y-6">
        <PageHeader title="Novo tipo de atendimento" description="Cadastre uma categoria para classificar os atendimentos técnicos." breadcrumbs={[{ label: "Visão geral", href: `/app/${organizationSlug}/dashboard` }, { label: "Tipos de atendimento", href: listPath }, { label: "Novo" }]} />
        <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
          <ServiceTypeForm
            organizationSlug={organizationSlug}
            initialValues={{ name: "", description: "", active: true }}
          />
        </section>
    </PageContainer>
  );
}
