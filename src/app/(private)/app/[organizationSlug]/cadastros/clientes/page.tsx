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
import { ClientFilters } from "@/features/clients/components/client-filters";
import { ClientList } from "@/features/clients/components/client-list";
import { ClientPagination } from "@/features/clients/components/client-pagination";
import { listClients } from "@/features/clients/queries/list-clients";
import { clientFilterSchema } from "@/features/clients/schemas/client-filter-schema";
import { requireOrganizationRole } from "@/features/organizations/application/require-organization-role";

type ClientsPageProps = {
  params: Promise<{ organizationSlug: string }>;
  searchParams: Promise<{ query?: string | string[]; status?: string | string[] }>;
};

const administrativeRoles = ["admin", "coordinator"] as const;

export default async function ClientsPage({ params, searchParams }: ClientsPageProps) {
  const [{ organizationSlug }, queryParams] = await Promise.all([params, searchParams]);
  const filters = clientFilterSchema.parse(queryParams);
  const [context, result] = await Promise.all([
    requireOrganizationRole(organizationSlug, administrativeRoles),
    listClients(organizationSlug, filters),
  ]);
  const hasFilters = filters.query !== "" || filters.status !== "all" || filters.page > 1;

  return (
    <ListPageShell>
        <PageHeader title="Clientes" description="Gerencie os clientes e suas unidades de atendimento." breadcrumbs={[{ label: "Cadastros" }, { label: "Clientes" }]} />
        <ListToolbar actions={<><Link href={`/app/${organizationSlug}/cadastros/clientes/novo`} className={buttonStyles({ size: "sm" })}><Plus aria-hidden="true" className="size-4" />Novo cliente</Link><RefreshListButton /></>} columnControl={<ColumnVisibilityMenu listKey="clients" columns={[{ key: "document", label: "Documento" }, { key: "units", label: "Unidades" }, { key: "updatedAt", label: "Atualização" }]} />}><ClientFilters organizationSlug={organizationSlug} filters={filters} /></ListToolbar>
        <ListPageContent>
          <ClientList organizationSlug={organizationSlug} clients={result.items} timezone={context.organization.timezone} hasFilters={hasFilters} />
        </ListPageContent>
        <ListPageFooter>
          <ClientPagination organizationSlug={organizationSlug} filters={filters} total={result.total} totalPages={result.totalPages} pageSize={result.pageSize} />
        </ListPageFooter>
    </ListPageShell>
  );
}
