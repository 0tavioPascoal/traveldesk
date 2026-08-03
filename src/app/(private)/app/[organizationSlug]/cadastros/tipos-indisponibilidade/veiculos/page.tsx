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
import { UnavailabilityTypeFilters } from "@/features/unavailabilities/components/unavailability-type-filters";
import { UnavailabilityTypeList } from "@/features/unavailabilities/components/unavailability-type-list";
import { UnavailabilityTypeTabs } from "@/features/unavailabilities/components/unavailability-type-tabs";
import { listVehicleUnavailabilityTypes } from "@/features/unavailabilities/queries/list-vehicle-unavailability-types";
import { unavailabilityTypeFilterSchema } from "@/features/unavailabilities/schemas/unavailability-filter-schema";

type Props = { params: Promise<{ organizationSlug: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function VehicleUnavailabilityTypesPage({ params, searchParams }: Props) {
  const { organizationSlug } = await params;
  const context = await requireOrganizationRole(organizationSlug, ["admin", "coordinator"] as const);
  const raw = await searchParams;
  const filters = unavailabilityTypeFilterSchema.parse(raw);
  const items = await listVehicleUnavailabilityTypes(organizationSlug, filters);
  const path = `/app/${organizationSlug}/cadastros/tipos-indisponibilidade/veiculos`;
  const feedback = typeof raw.feedback === "string" ? raw.feedback : null;
  return (
    <ListPageShell>
      <PageHeader title="Tipos de indisponibilidade" description="Configure os motivos utilizados para bloquear técnicos e veículos." breadcrumbs={[{ label: "Cadastros" }, { label: "Tipos de indisponibilidade" }]} />
      {feedback === "created" || feedback === "updated" ? <InlineAlert tone="success">Tipo {feedback === "created" ? "cadastrado" : "atualizado"} com sucesso.</InlineAlert> : null}
      <UnavailabilityTypeTabs organizationSlug={organizationSlug} resource="vehicles" />
      <ListToolbar actions={<><Link href={`${path}/novo`} className={buttonStyles({ size: "sm" })}><Plus aria-hidden="true" className="size-4" />Novo tipo para veículo</Link><RefreshListButton /></>}><UnavailabilityTypeFilters path={path} filters={filters} /></ListToolbar>
      <ListPageContent>
        <UnavailabilityTypeList organizationSlug={organizationSlug} resource="vehicles" items={items} timezone={context.organization.timezone} hasFilters={Boolean(filters.query || filters.status !== "all")} />
      </ListPageContent>
      <ListPageFooter>
        <ListPagination ariaLabel="Resumo de tipos para veículos" page={1} totalPages={1} total={items.length} pageSize={Math.max(items.length, 1)} itemName={{ singular: "tipo", plural: "tipos" }} href={() => path} />
      </ListPageFooter>
    </ListPageShell>
  );
}
