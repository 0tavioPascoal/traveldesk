import { Plus } from "lucide-react";
import Link from "next/link";

import { PageContainer } from "@/components/page/page-container";
import { PageHeader } from "@/components/page/page-header";
import { buttonStyles } from "@/components/ui/button";
import { requireOrganizationRole } from "@/features/organizations/application/require-organization-role";
import { TripFilters } from "@/features/trips/components/trip-filters";
import { TripList } from "@/features/trips/components/trip-list";
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
  const trips = await listTrips(organizationSlug, filters);
  const hasFilters = Boolean(
    filters.query ||
    filters.status !== "all" ||
    filters.priority !== "all" ||
    filters.startsOn ||
    filters.endsOn,
  );

  return (
    <PageContainer className="space-y-6">
        <PageHeader
          title="Viagens"
          description="Planeje, acompanhe e execute as viagens técnicas da organização."
          breadcrumbs={[
            { label: "Visão geral", href: `/app/${organizationSlug}/dashboard` },
            { label: "Planejamento" },
            { label: "Viagens" },
          ]}
          actions={<Link href={`/app/${organizationSlug}/planejamento/viagens/nova`} className={buttonStyles()}><Plus aria-hidden="true" className="size-4" />Nova viagem</Link>}
        />
        <section aria-label="Pesquisa e filtros de viagens" className="rounded-xl border border-border bg-card p-4 shadow-sm sm:p-5">
          <TripFilters organizationSlug={organizationSlug} filters={filters} />
        </section>
        <div role="status" className="flex items-center justify-between text-sm text-muted-foreground">
          <p>{trips.length} {trips.length === 1 ? "viagem encontrada" : "viagens encontradas"}</p>
        </div>
        <TripList
          organizationSlug={organizationSlug}
          items={trips}
          timezone={context.organization.timezone}
          hasFilters={hasFilters}
        />
    </PageContainer>
  );
}
