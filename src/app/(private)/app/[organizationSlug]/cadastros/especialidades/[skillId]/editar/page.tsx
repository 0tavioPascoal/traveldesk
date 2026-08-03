import { notFound } from "next/navigation";

import { FormPageContainer } from "@/components/page/page-container";
import { PageHeader } from "@/components/page/page-header";
import { SkillForm } from "@/features/skills/components/skill-form";
import { getSkillById } from "@/features/skills/queries/get-skill-by-id";

type EditSkillPageProps = {
  params: Promise<{ organizationSlug: string; skillId: string }>;
};

export default async function EditSkillPage({ params }: EditSkillPageProps) {
  const { organizationSlug, skillId } = await params;
  const skill = await getSkillById(organizationSlug, skillId);

  if (!skill) {
    notFound();
  }

  const listPath = `/app/${organizationSlug}/cadastros/especialidades`;

  return (
    <FormPageContainer>
        <PageHeader title="Editar especialidade" description="Atualize a competência e sua disponibilidade para novos vínculos." breadcrumbs={[{ label: "Visão geral", href: `/app/${organizationSlug}/dashboard` }, { label: "Especialidades", href: listPath }, { label: "Editar" }]} />
          <SkillForm
            organizationSlug={organizationSlug}
            skillId={skill.id}
            initialValues={{
              name: skill.name,
              description: skill.description ?? "",
              active: skill.active,
            }}
          />
    </FormPageContainer>
  );
}
