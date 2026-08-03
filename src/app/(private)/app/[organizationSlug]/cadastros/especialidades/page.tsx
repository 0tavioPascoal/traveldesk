import { Plus } from "lucide-react";
import Link from "next/link";

import {
  ListPageContent,
  ListPageFooter,
  ListPageShell,
} from "@/components/list-page/list-page-shell";
import { ListPagination } from "@/components/list-page/list-pagination";
import { ListToolbar } from "@/components/list-page/list-toolbar";
import { RefreshListButton } from "@/components/list-page/refresh-list-button";
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
    <ListPageShell>
        <PageHeader title="Especialidades" description="Gerencie as competências utilizadas na composição das equipes técnicas." breadcrumbs={[{ label: "Cadastros" }, { label: "Especialidades" }]} />

        {feedback ? (
          <InlineAlert tone="success">{feedback}</InlineAlert>
        ) : null}

        <ListToolbar actions={<><Link href={`/app/${organizationSlug}/cadastros/especialidades/nova`} className={buttonStyles({ size: "sm" })}><Plus aria-hidden="true" className="size-4" />Nova especialidade</Link><RefreshListButton /></>}>
          <SkillFilters organizationSlug={organizationSlug} filters={filters} />
        </ListToolbar>

        <ListPageContent>
          <SkillList
              organizationSlug={organizationSlug}
              skills={skills}
              timezone={context.organization.timezone}
              hasFilters={hasFilters}
          />
        </ListPageContent>
        <ListPageFooter>
          <ListPagination ariaLabel="Resumo de especialidades" page={1} totalPages={1} total={skills.length} pageSize={Math.max(skills.length, 1)} itemName={{ singular: "especialidade", plural: "especialidades" }} href={() => `/app/${organizationSlug}/cadastros/especialidades`} />
        </ListPageFooter>
    </ListPageShell>
  );
}
