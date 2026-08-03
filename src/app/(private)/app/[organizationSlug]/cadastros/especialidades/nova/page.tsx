import { FormPageContainer } from "@/components/page/page-container";
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
    <FormPageContainer>
        <PageHeader title="Nova especialidade" description="Cadastre uma competência técnica para utilizar nas equipes e nos requisitos das viagens." breadcrumbs={[{ label: "Visão geral", href: `/app/${organizationSlug}/dashboard` }, { label: "Especialidades", href: listPath }, { label: "Nova" }]} />
          <SkillForm
            organizationSlug={organizationSlug}
            initialValues={{ name: "", description: "", active: true }}
          />
    </FormPageContainer>
  );
}
