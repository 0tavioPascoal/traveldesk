import { PageContainer } from "@/components/page/page-container";
import { PageHeader } from "@/components/page/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { InlineAlert } from "@/components/ui/inline-alert";
import { AnalyticsCharts } from "@/features/analytics/components/analytics-charts";
import { AnalyticsActiveFilters, AnalyticsControls } from "@/features/analytics/components/analytics-controls";
import { getAnalyticsData } from "@/features/analytics/queries/get-analytics-data";
import { analyticsFilterSchema } from "@/features/analytics/schemas/analytics-filter-schema";

type AnalyticsPageProps = {
  params: Promise<{ organizationSlug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AnalyticsPage({ params, searchParams }: AnalyticsPageProps) {
  const { organizationSlug } = await params;
  const requestedFilters = analyticsFilterSchema.parse(await searchParams);
  const data = await getAnalyticsData(organizationSlug, requestedFilters);

  return (
    <PageContainer className="max-w-[96rem] space-y-4">
      <PageHeader
        title="Análises"
        description="Explore os dados de viagens e recursos da organização por meio de gráficos."
        breadcrumbs={[
          { label: "Visão geral", href: `/app/${organizationSlug}/dashboard` },
          { label: "Análises" },
        ]}
        actions={
          <AnalyticsControls
            organizationSlug={organizationSlug}
            filters={data.filters}
            options={data.options}
            timezone={data.timezone}
          />
        }
      />
      <p className="text-sm text-muted-foreground">
        Período analisado: <span className="font-medium text-foreground">{data.period.label}</span>
        <span className="hidden sm:inline"> · {data.timezone}</span>
      </p>
      <AnalyticsActiveFilters
        organizationSlug={organizationSlug}
        filters={data.filters}
        options={data.options}
      />
      {data.limited ? (
        <InlineAlert tone="warning">
          O volume encontrado excede o limite seguro desta visualização. Refine o período ou os filtros para obter uma análise completa.
        </InlineAlert>
      ) : null}
      {data.totalTrips ? (
        <AnalyticsCharts data={data} />
      ) : (
        <EmptyState
          title="Ainda não há dados para análise"
          description="Nenhuma viagem foi encontrada para o período e os filtros selecionados."
        />
      )}
    </PageContainer>
  );
}
