import Link from "next/link";

import { PageContainer } from "@/components/page/page-container";
import { PageHeader } from "@/components/page/page-header";
import { buttonStyles } from "@/components/ui/button";
import { ClientFilters } from "@/features/clients/components/client-filters";
import { ClientList } from "@/features/clients/components/client-list";
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
  const [context, clients] = await Promise.all([
    requireOrganizationRole(organizationSlug, administrativeRoles),
    listClients(organizationSlug, filters),
  ]);
  const hasFilters = filters.query !== "" || filters.status !== "all";

  return (
    <PageContainer className="space-y-6">
        <PageHeader title="Clientes" description="Gerencie os clientes e suas unidades de atendimento." breadcrumbs={[{ label: "Visão geral", href: `/app/${organizationSlug}/dashboard` }, { label: "Cadastros" }, { label: "Clientes" }]} actions={<Link href={`/app/${organizationSlug}/cadastros/clientes/novo`} className={`${buttonStyles()} w-full sm:w-auto`}>Novo cliente</Link>} />
        <section aria-label="Pesquisa e filtros" className="rounded-2xl border border-border bg-card p-4 sm:p-5"><ClientFilters organizationSlug={organizationSlug} filters={filters} /></section>
        <ClientList organizationSlug={organizationSlug} clients={clients} timezone={context.organization.timezone} hasFilters={hasFilters} />
    </PageContainer>
  );
}
