import Link from "next/link";

import { PageContainer } from "@/components/page/page-container";
import { PageHeader } from "@/components/page/page-header";
import { buttonStyles } from "@/components/ui/button";
import { InlineAlert } from "@/components/ui/inline-alert";
import { requireOrganizationRole } from "@/features/organizations/application/require-organization-role";
import { ServiceTypeFilters } from "@/features/service-types/components/service-type-filters";
import { ServiceTypeList } from "@/features/service-types/components/service-type-list";
import { listServiceTypes } from "@/features/service-types/queries/list-service-types";
import { serviceTypeFilterSchema } from "@/features/service-types/schemas/service-type-filter-schema";

type ServiceTypesPageProps = {
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
    return "Tipo de atendimento cadastrado com sucesso.";
  }

  if (feedback === "updated") {
    return "Tipo de atendimento atualizado com sucesso.";
  }

  return null;
}

export default async function ServiceTypesPage({
  params,
  searchParams,
}: ServiceTypesPageProps) {
  const [{ organizationSlug }, queryParams] = await Promise.all([
    params,
    searchParams,
  ]);
  const filters = serviceTypeFilterSchema.parse({
    query: queryParams.query,
    status: queryParams.status,
  });
  const [context, serviceTypes] = await Promise.all([
    requireOrganizationRole(organizationSlug, administrativeRoles),
    listServiceTypes(organizationSlug, filters),
  ]);
  const feedback = getFeedback(queryParams.feedback);
  const hasFilters = filters.query !== "" || filters.status !== "all";

  return (
    <PageContainer className="max-w-6xl space-y-6">
        <PageHeader title="Tipos de atendimento" description="Gerencie as categorias utilizadas para classificar os atendimentos técnicos." breadcrumbs={[{ label: "Visão geral", href: `/app/${organizationSlug}/dashboard` }, { label: "Cadastros" }, { label: "Tipos de atendimento" }]} actions={<Link href={`/app/${organizationSlug}/cadastros/tipos-atendimento/novo`} className={`${buttonStyles()} w-full sm:w-auto`}>Novo tipo de atendimento</Link>} />

        {feedback ? (
          <InlineAlert tone="success">{feedback}</InlineAlert>
        ) : null}

        <section aria-label="Pesquisa e filtros" className="rounded-2xl border border-border bg-card p-5">
          <ServiceTypeFilters
            organizationSlug={organizationSlug}
            filters={filters}
          />
        </section>

        <section>
          <ServiceTypeList
            organizationSlug={organizationSlug}
            serviceTypes={serviceTypes}
            timezone={context.organization.timezone}
            hasFilters={hasFilters}
          />
        </section>
    </PageContainer>
  );
}
