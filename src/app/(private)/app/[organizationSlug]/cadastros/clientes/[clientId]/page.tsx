import { Pencil, Plus } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PageContainer } from "@/components/page/page-container";
import { PageHeader } from "@/components/page/page-header";
import { SectionHeader } from "@/components/page/section-header";
import { ActiveStatusBadge } from "@/components/ui/active-status-badge";
import { buttonStyles } from "@/components/ui/button";
import { InlineAlert } from "@/components/ui/inline-alert";
import { ClientDetails } from "@/features/clients/components/client-details";
import { ClientStatusAction } from "@/features/clients/components/client-status-action";
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
  const listPath = `/app/${organizationSlug}/cadastros/clientes`;

  return (
    <PageContainer className="space-y-6">
      <PageHeader
        title={client.legal_name}
        description={[client.trade_name, client.tax_id ? client.tax_id.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5") : null].filter(Boolean).join(" • ") || "Dados cadastrais do cliente"}
        breadcrumbs={[{ label: "Visão geral", href: `/app/${organizationSlug}/dashboard` }, { label: "Cadastros" }, { label: "Clientes", href: listPath }, { label: client.legal_name }]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <ActiveStatusBadge active={client.active} />
            <Link href={`${listPath}/${client.id}/editar`} className={buttonStyles({ variant: "secondary" })}><Pencil aria-hidden="true" className="size-4" />Editar cliente</Link>
            <ClientStatusAction key={`${client.id}-${client.active}`} organizationSlug={organizationSlug} clientId={client.id} active={client.active} />
          </div>
        }
      />

      {feedback ? <InlineAlert tone="success">{feedback}</InlineAlert> : null}

      <nav aria-label="Seções do cliente" className="flex gap-1 overflow-x-auto border-b border-border">
        <a href="#visao-geral" className="min-h-11 whitespace-nowrap border-b-2 border-primary px-3 py-2.5 text-sm font-semibold text-primary">Visão geral</a>
        <a href="#unidades" className="min-h-11 whitespace-nowrap border-b-2 border-transparent px-3 py-2.5 text-sm font-semibold text-muted-foreground hover:border-border hover:text-foreground">Unidades <span className="ml-1 text-xs">({client.unitCount})</span></a>
      </nav>

      <ClientDetails client={client} />

      <section id="unidades" aria-labelledby="client-units-title" className="scroll-mt-6 rounded-2xl border border-border bg-card p-4 sm:p-6">
        <SectionHeader
          id="client-units-title"
          title="Unidades"
          description="Locais de atendimento vinculados a este cliente."
          actions={client.active ? <Link href={`${listPath}/${client.id}/unidades/nova`} className={`${buttonStyles()} w-full sm:w-auto`}><Plus aria-hidden="true" className="size-4" />Nova unidade</Link> : undefined}
        />
        {!client.active ? <div className="mt-5"><InlineAlert tone="warning">Ative o cliente para cadastrar ou reativar unidades.</InlineAlert></div> : null}
        <div className="mt-6 rounded-xl border border-border bg-muted/30 p-4"><ClientUnitFilters organizationSlug={organizationSlug} clientId={client.id} filters={filters} /></div>
        <div className="mt-6"><ClientUnitList organizationSlug={organizationSlug} clientId={client.id} units={units} hasFilters={hasFilters} clientActive={client.active} /></div>
      </section>
    </PageContainer>
  );
}
