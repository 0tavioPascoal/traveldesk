import { ShieldCheck } from "lucide-react";

import { PageContainer } from "@/components/page/page-container";
import { PageHeader } from "@/components/page/page-header";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { InlineAlert } from "@/components/ui/inline-alert";
import { DashboardFilters } from "@/features/dashboard/components/dashboard-filters";
import { DashboardCharts, DashboardMetrics } from "@/features/dashboard/components/dashboard-overview";
import { getOperationalDashboard } from "@/features/dashboard/queries/get-operational-dashboard";
import { dashboardFilterSchema } from "@/features/dashboard/schemas/dashboard-filter-schema";
import { requireOrganizationMember } from "@/features/organizations/application/require-organization-member";
import { organizationRoleLabels } from "@/features/organizations/types/organization";

type OrganizationDashboardPageProps = {
  params: Promise<{ organizationSlug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function OrganizationDashboardPage({
  params,
  searchParams,
}: OrganizationDashboardPageProps) {
  const { organizationSlug } = await params;
  const context = await requireOrganizationMember(organizationSlug);

  if (context.membership.role === "technician") {
    return (
      <PageContainer className="max-w-6xl space-y-6">
        <PageHeader
          title="Dashboard analítico"
          eyebrow={context.organization.name}
          description="Indicadores consolidados da organização."
        />
        <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
          <div className="flex items-start gap-4">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent text-accent-foreground">
              <ShieldCheck aria-hidden="true" className="size-5" />
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-semibold text-card-foreground">Acesso técnico</h2>
                <Badge tone="neutral">{organizationRoleLabels[context.membership.role]}</Badge>
              </div>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                Os indicadores consolidados de planejamento são restritos aos papéis administrativos. Nenhum dado operacional de outras pessoas ou recursos foi carregado nesta página.
              </p>
            </div>
          </div>
        </section>
      </PageContainer>
    );
  }

  const filters = dashboardFilterSchema.parse(await searchParams);
  const data = await getOperationalDashboard(organizationSlug, filters);

  return (
    <PageContainer className="max-w-[96rem] space-y-4">
      <PageHeader
        title="Dashboard analítico"
        eyebrow={context.organization.name}
        description="Indicadores e gráficos consolidados das viagens e dos recursos da organização."
        actions={
          <DashboardFilters
            organizationSlug={organizationSlug}
            filters={data.filters}
            periodLabel={data.period.label}
          />
        }
      />
      <p className="text-sm text-muted-foreground">
        Período analisado: <span className="font-medium text-foreground">{data.period.label}</span>
        <span className="hidden sm:inline"> · {data.timezone}</span>
      </p>
      {data.limited ? (
        <InlineAlert tone="warning">
          O período excede o limite seguro do dashboard. Consulte as listagens operacionais para visualizar os demais registros.
        </InlineAlert>
      ) : null}
      {!data.hasOperationalData ? (
        <EmptyState
          title="Ainda não há dados para análise"
          description="Os indicadores e gráficos serão apresentados quando houver viagens ou recursos cadastrados."
        />
      ) : (
        <>
          <DashboardMetrics organizationSlug={organizationSlug} data={data} />
          <DashboardCharts organizationSlug={organizationSlug} data={data} />
        </>
      )}
    </PageContainer>
  );
}
