import { Plus } from "lucide-react";
import Link from "next/link";

import { ColumnVisibilityMenu } from "@/components/list-page/column-visibility-menu";
import {
  ListPageContent,
  ListPageFooter,
  ListPageShell,
} from "@/components/list-page/list-page-shell";
import { ListToolbar } from "@/components/list-page/list-toolbar";
import { RefreshListButton } from "@/components/list-page/refresh-list-button";
import { PageHeader } from "@/components/page/page-header";
import { buttonStyles } from "@/components/ui/button";
import { requireOrganizationRole } from "@/features/organizations/application/require-organization-role";
import { TripFilters } from "@/features/trips/components/trip-filters";
import { TripList } from "@/features/trips/components/trip-list";
import { TripPagination } from "@/features/trips/components/trip-pagination";
import { listTrips } from "@/features/trips/queries/list-trips";
import { tripFilterSchema } from "@/features/trips/schemas/trip-filter-schema";

type Props = {
  params: Promise<{ organizationSlug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function TripsPage({ params, searchParams }: Props) {
  const { organizationSlug } = await params;
  const context = await requireOrganizationRole(
    organizationSlug,
    ["admin", "coordinator"] as const,
  );
  const filters = tripFilterSchema.parse(await searchParams);
  const result = await listTrips(organizationSlug, filters);
  const hasFilters = Boolean(
    filters.query ||
    filters.status !== "all" ||
    filters.priority !== "all" ||
    filters.startsOn ||
    filters.endsOn,
  );

  return (
    <ListPageShell>
        <PageHeader
          title="Viagens"
          description="Planeje, acompanhe e execute as viagens técnicas da organização."
          breadcrumbs={[
            { label: "Planejamento" },
            { label: "Viagens" },
          ]}
        />
        <ListToolbar
          actions={<><Link href={`/app/${organizationSlug}/planejamento/viagens/nova`} className={buttonStyles({ size: "sm" })}><Plus aria-hidden="true" className="size-4" />Nova viagem</Link><RefreshListButton /></>}
          columnControl={<ColumnVisibilityMenu listKey="trips" columns={[{ key: "client", label: "Cliente e unidade" }, { key: "period", label: "Período" }, { key: "nextStep", label: "Próxima etapa" }, { key: "priority", label: "Prioridade" }]} />}
        >
          <TripFilters
            organizationSlug={organizationSlug}
            filters={filters}
            timezone={context.organization.timezone}
          />
        </ListToolbar>
        <ListPageContent>
          <TripList
            organizationSlug={organizationSlug}
            items={result.items}
            timezone={context.organization.timezone}
            hasFilters={hasFilters}
          />
        </ListPageContent>
        <ListPageFooter>
          <TripPagination organizationSlug={organizationSlug} filters={filters} total={result.total} totalPages={result.totalPages} pageSize={result.pageSize} />
        </ListPageFooter>
    </ListPageShell>
  );
}
