import { ColumnVisibilityMenu } from "@/components/list-page/column-visibility-menu";
import {
  ListPageContent,
  ListPageFooter,
  ListPageShell,
} from "@/components/list-page/list-page-shell";
import { ListToolbar } from "@/components/list-page/list-toolbar";
import { RefreshListButton } from "@/components/list-page/refresh-list-button";
import { PageHeader } from "@/components/page/page-header";
import { ClientUnitOverviewFilters } from "@/features/clients/components/client-unit-overview-filters";
import { ClientUnitOverviewList } from "@/features/clients/components/client-unit-overview-list";
import { ClientUnitOverviewPagination } from "@/features/clients/components/client-unit-overview-pagination";
import { listAllClientUnits } from "@/features/clients/queries/list-all-client-units";
import { clientUnitListFilterSchema } from "@/features/clients/schemas/client-unit-list-filter-schema";

type ClientUnitsPageProps = {
  params: Promise<{ organizationSlug: string }>;
  searchParams: Promise<{
    query?: string | string[];
    status?: string | string[];
    page?: string | string[];
  }>;
};

export default async function ClientUnitsPage({
  params,
  searchParams,
}: ClientUnitsPageProps) {
  const [{ organizationSlug }, queryParams] = await Promise.all([
    params,
    searchParams,
  ]);
  const filters = clientUnitListFilterSchema.parse(queryParams);
  const result = await listAllClientUnits(organizationSlug, filters);
  const hasFilters =
    filters.query !== "" || filters.status !== "all" || filters.page > 1;

  return (
    <ListPageShell>
      <PageHeader
        title="Unidades"
        description="Consulte e gerencie os locais de atendimento vinculados aos clientes."
        breadcrumbs={[
          { label: "Cadastros" },
          { label: "Unidades" },
        ]}
      />
      <ListToolbar
        actions={<RefreshListButton />}
        columnControl={<ColumnVisibilityMenu listKey="units" columns={[{ key: "client", label: "Cliente" }, { key: "location", label: "Localização" }]} />}
      >
        <ClientUnitOverviewFilters
          organizationSlug={organizationSlug}
          filters={filters}
        />
      </ListToolbar>
      <ListPageContent>
        <ClientUnitOverviewList
          organizationSlug={organizationSlug}
          units={result.items}
          hasFilters={hasFilters}
        />
      </ListPageContent>
      <ListPageFooter>
        <ClientUnitOverviewPagination
          organizationSlug={organizationSlug}
          filters={filters}
          total={result.total}
          totalPages={result.totalPages}
          pageSize={result.pageSize}
        />
      </ListPageFooter>
    </ListPageShell>
  );
}
