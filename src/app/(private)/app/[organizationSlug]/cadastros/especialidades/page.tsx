import Link from "next/link";

import { PageContainer } from "@/components/page/page-container";
import { PageHeader } from "@/components/page/page-header";
import { buttonStyles } from "@/components/ui/button";
import { InlineAlert } from "@/components/ui/inline-alert";
import { requireOrganizationRole } from "@/features/organizations/application/require-organization-role";
import { SkillFilters } from "@/features/skills/components/skill-filters";
import { SkillList } from "@/features/skills/components/skill-list";
import { listSkills } from "@/features/skills/queries/list-skills";
import { skillFilterSchema } from "@/features/skills/schemas/skill-filter-schema";

type SkillsPageProps = {
  params: Promise<{ organizationSlug: string }>;
  searchParams: Promise<{
    query?: string | string[];
    status?: string | string[];
    feedback?: string | string[];
  }>;
};

const administrativeRoles = ["admin", "coordinator"] as const;

function getFeedback(value: string | string[] | undefined) {
  const feedback = Array.isArray(value) ? value[0] : value;

  if (feedback === "created") {
    return "Especialidade cadastrada com sucesso.";
  }

  if (feedback === "updated") {
    return "Especialidade atualizada com sucesso.";
  }

  return null;
}

export default async function SkillsPage({
  params,
  searchParams,
}: SkillsPageProps) {
  const [{ organizationSlug }, queryParams] = await Promise.all([
    params,
    searchParams,
  ]);
  const filters = skillFilterSchema.parse({
    query: queryParams.query,
    status: queryParams.status,
  });
  const [context, skills] = await Promise.all([
    requireOrganizationRole(organizationSlug, administrativeRoles),
    listSkills(organizationSlug, filters),
  ]);
  const feedback = getFeedback(queryParams.feedback);
  const hasFilters = filters.query !== "" || filters.status !== "all";

  return (
    <PageContainer className="max-w-6xl space-y-6">
        <PageHeader title="Especialidades" description="Gerencie as competências utilizadas na composição das equipes técnicas." breadcrumbs={[{ label: "Visão geral", href: `/app/${organizationSlug}/dashboard` }, { label: "Cadastros" }, { label: "Especialidades" }]} actions={<Link href={`/app/${organizationSlug}/cadastros/especialidades/nova`} className={`${buttonStyles()} w-full sm:w-auto`}>Nova especialidade</Link>} />

        {feedback ? (
          <InlineAlert tone="success">{feedback}</InlineAlert>
        ) : null}

        <section aria-label="Pesquisa e filtros" className="rounded-2xl border border-border bg-card p-5">
          <SkillFilters organizationSlug={organizationSlug} filters={filters} />
        </section>

        <section>
          <SkillList
            organizationSlug={organizationSlug}
            skills={skills}
            timezone={context.organization.timezone}
            hasFilters={hasFilters}
          />
        </section>
    </PageContainer>
  );
}
