import Link from "next/link";
import { notFound } from "next/navigation";

import { ClientDetails } from "@/features/clients/components/client-details";
import { ClientUnitFilters } from "@/features/clients/components/client-unit-filters";
import { ClientUnitList } from "@/features/clients/components/client-unit-list";
import { getClientById } from "@/features/clients/queries/get-client-by-id";
import { listClientUnits } from "@/features/clients/queries/list-client-units";
import { clientUnitFilterSchema } from "@/features/clients/schemas/client-unit-filter-schema";

type ClientPageProps = {
  params: Promise<{ organizationSlug: string; clientId: string }>;
  searchParams: Promise<{ unitQuery?: string | string[]; unitStatus?: string | string[]; feedback?: string | string[] }>;
};

function feedbackMessage(value: string | string[] | undefined) {
  const feedback = Array.isArray(value) ? value[0] : value;
  const messages = {
    created: "Cliente cadastrado com sucesso.",
    updated: "Cliente atualizado com sucesso.",
    "unit-created": "Unidade cadastrada com sucesso.",
    "unit-updated": "Unidade atualizada com sucesso.",
  } as const;
  return feedback && feedback in messages ? messages[feedback as keyof typeof messages] : null;
}

export default async function ClientPage({ params, searchParams }: ClientPageProps) {
  const [{ organizationSlug, clientId }, queryParams] = await Promise.all([params, searchParams]);
  const client = await getClientById(organizationSlug, clientId);
  if (!client) notFound();

  const filters = clientUnitFilterSchema.parse({ query: queryParams.unitQuery, status: queryParams.unitStatus });
  const units = await listClientUnits(organizationSlug, client.id, filters);
  const feedback = feedbackMessage(queryParams.feedback);
  const hasFilters = filters.query !== "" || filters.status !== "all";

  return (
    <main className="min-h-screen bg-zinc-100 px-4 py-8 sm:px-6 lg:px-8"><div className="mx-auto max-w-6xl space-y-6"><Link href={`/app/${organizationSlug}/cadastros/clientes`} className="text-sm font-medium text-zinc-600 hover:text-zinc-950">← Voltar para clientes</Link>{feedback ? <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{feedback}</p> : null}<ClientDetails organizationSlug={organizationSlug} client={client} /><section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm"><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-xl font-bold text-zinc-950">Unidades</h2><p className="mt-1 text-sm text-zinc-600">Locais vinculados a este cliente.</p></div>{client.active ? <Link href={`/app/${organizationSlug}/cadastros/clientes/${client.id}/unidades/nova`} className="inline-flex h-10 items-center justify-center rounded-lg bg-zinc-950 px-4 text-sm font-semibold text-white">Nova unidade</Link> : <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">Ative o cliente para cadastrar unidades.</p>}</div><div className="mt-6"><ClientUnitFilters organizationSlug={organizationSlug} clientId={client.id} filters={filters} /></div><div className="mt-6"><ClientUnitList organizationSlug={organizationSlug} clientId={client.id} units={units} hasFilters={hasFilters} clientActive={client.active} /></div></section></div></main>
  );
}
