import Link from "next/link";

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
    <main className="min-h-screen bg-zinc-100 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <Link
            href={`/app/${organizationSlug}/dashboard`}
            className="text-sm font-medium text-zinc-600 hover:text-zinc-950"
          >
            ← Voltar ao dashboard
          </Link>
          <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-500">
                {context.organization.name}
              </p>
              <h1 className="mt-1 text-2xl font-bold text-zinc-950">
                Especialidades
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
                Gerencie as especialidades técnicas disponíveis nesta organização.
              </p>
            </div>
            <Link
              href={`/app/${organizationSlug}/cadastros/especialidades/nova`}
              className="inline-flex h-11 items-center justify-center rounded-lg bg-zinc-950 px-4 text-sm font-semibold text-white hover:bg-zinc-800"
            >
              Nova especialidade
            </Link>
          </div>
        </header>

        {feedback ? (
          <p
            role="status"
            className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
          >
            {feedback}
          </p>
        ) : null}

        <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
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
      </div>
    </main>
  );
}
