import { PageContainer } from "@/components/page/page-container";
import { PageHeader } from "@/components/page/page-header";
import { requireOrganizationRole } from "@/features/organizations/application/require-organization-role";
import { SkillForm } from "@/features/skills/components/skill-form";

type NewSkillPageProps = {
  params: Promise<{ organizationSlug: string }>;
};

const administrativeRoles = ["admin", "coordinator"] as const;

export default async function NewSkillPage({ params }: NewSkillPageProps) {
  const { organizationSlug } = await params;
  await requireOrganizationRole(
    organizationSlug,
    administrativeRoles,
  );
  const listPath = `/app/${organizationSlug}/cadastros/especialidades`;

  return (
    <PageContainer className="max-w-3xl space-y-6">
        <PageHeader title="Nova especialidade" description="Cadastre uma competência técnica para utilizar nas equipes e nos requisitos das viagens." breadcrumbs={[{ label: "Visão geral", href: `/app/${organizationSlug}/dashboard` }, { label: "Especialidades", href: listPath }, { label: "Nova" }]} />
        <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
          <SkillForm
            organizationSlug={organizationSlug}
            initialValues={{ name: "", description: "", active: true }}
          />
        </section>
    </PageContainer>
  );
}
