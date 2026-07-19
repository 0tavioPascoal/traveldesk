import Link from "next/link";

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
    <main className="min-h-screen bg-zinc-100 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <Link href={`/app/${organizationSlug}/dashboard`} className="text-sm font-medium text-zinc-600 hover:text-zinc-950">← Voltar ao dashboard</Link>
          <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-medium text-zinc-500">{context.organization.name}</p><h1 className="mt-1 text-2xl font-bold text-zinc-950">Clientes</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">Gerencie clientes e suas unidades operacionais.</p></div><Link href={`/app/${organizationSlug}/cadastros/clientes/novo`} className="inline-flex h-11 items-center justify-center rounded-lg bg-zinc-950 px-4 text-sm font-semibold text-white hover:bg-zinc-800">Novo cliente</Link></div>
        </header>
        <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm"><ClientFilters organizationSlug={organizationSlug} filters={filters} /></section>
        <ClientList organizationSlug={organizationSlug} clients={clients} timezone={context.organization.timezone} hasFilters={hasFilters} />
      </div>
    </main>
  );
}
