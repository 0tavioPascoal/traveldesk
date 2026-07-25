import { Building2, Eye, Pencil } from "lucide-react";
import Link from "next/link";

import { ActiveStatusBadge } from "@/components/ui/active-status-badge";
import { buttonStyles } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { NoResultsState } from "@/components/ui/no-results-state";
import { ClientStatusAction } from "@/features/clients/components/client-status-action";
import type { ClientListItem } from "@/features/clients/types/client";

type ClientListProps = {
  organizationSlug: string;
  clients: ClientListItem[];
  timezone: string;
  hasFilters: boolean;
};

function formatTaxId(value: string | null) {
  return value
    ? value.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5")
    : "Não informado";
}

function formatDate(value: string, timezone: string) {
  try {
    return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeZone: timezone }).format(new Date(value));
  } catch {
    return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(new Date(value));
  }
}

function unitLabel(count: number) {
  if (count === 0) return "Nenhuma unidade";
  return `${count} ${count === 1 ? "unidade" : "unidades"}`;
}

export function ClientList({ organizationSlug, clients, timezone, hasFilters }: ClientListProps) {
  const listPath = `/app/${organizationSlug}/cadastros/clientes`;
  const newPath = `${listPath}/novo`;

  if (clients.length === 0) {
    return hasFilters ? (
      <NoResultsState description="Revise os filtros ou limpe a pesquisa para encontrar outros clientes." action={{ href: listPath, label: "Limpar filtros" }} />
    ) : (
      <EmptyState icon={Building2} title="Nenhum cliente cadastrado" description="Cadastre o primeiro cliente para começar a organizar as unidades de atendimento." action={{ href: newPath, label: "Novo cliente" }} />
    );
  }

  return (
    <>
      <div className="hidden overflow-hidden rounded-2xl border border-border bg-card md:block">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">Clientes cadastrados na organização</caption>
          <thead className="border-b border-border bg-muted/70 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th scope="col" className="px-5 py-3 font-semibold">Cliente</th>
              <th scope="col" className="px-5 py-3 font-semibold">Documento</th>
              <th scope="col" className="px-5 py-3 font-semibold">Unidades</th>
              <th scope="col" className="px-5 py-3 font-semibold">Situação</th>
              <th scope="col" className="hidden px-5 py-3 font-semibold xl:table-cell">Atualização</th>
              <th scope="col" className="px-5 py-3 text-right font-semibold">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {clients.map((client) => {
              const detailPath = `${listPath}/${client.id}`;
              return (
                <tr key={client.id} className="transition-colors hover:bg-muted/45 focus-within:bg-muted/45">
                  <td className="max-w-sm px-5 py-4">
                    <Link href={detailPath} className="font-semibold text-foreground hover:text-primary hover:underline">{client.legal_name}</Link>
                    <p className="mt-1 truncate text-sm text-muted-foreground">{client.trade_name ?? "Sem nome fantasia"}</p>
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 font-mono text-xs text-muted-foreground">{formatTaxId(client.tax_id)}</td>
                  <td className="px-5 py-4 text-muted-foreground">
                    <span className="inline-flex items-center gap-2"><Building2 aria-hidden="true" className="size-4" />{unitLabel(client.unitCount)}</span>
                  </td>
                  <td className="px-5 py-4"><ActiveStatusBadge active={client.active} /></td>
                  <td className="hidden whitespace-nowrap px-5 py-4 text-muted-foreground xl:table-cell">{formatDate(client.updated_at, timezone)}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={detailPath} aria-label={`Visualizar ${client.legal_name}`} className={`${buttonStyles({ variant: "ghost", size: "sm" })} px-2`}><Eye aria-hidden="true" className="size-4" /><span className="sr-only xl:not-sr-only">Visualizar</span></Link>
                      <Link href={`${detailPath}/editar`} aria-label={`Editar ${client.legal_name}`} className={`${buttonStyles({ variant: "ghost", size: "sm" })} px-2`}><Pencil aria-hidden="true" className="size-4" /><span className="sr-only xl:not-sr-only">Editar</span></Link>
                      <ClientStatusAction key={`${client.id}-${client.active}`} organizationSlug={organizationSlug} clientId={client.id} active={client.active} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 md:hidden" aria-label="Clientes cadastrados">
        {clients.map((client) => {
          const detailPath = `${listPath}/${client.id}`;
          return (
            <article key={client.id} className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <Link href={detailPath} className="font-semibold text-card-foreground hover:text-primary hover:underline">{client.legal_name}</Link>
                  <p className="mt-1 truncate text-sm text-muted-foreground">{client.trade_name ?? "Sem nome fantasia"}</p>
                </div>
                <ActiveStatusBadge active={client.active} />
              </div>
              <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                <div><dt className="text-xs font-medium text-muted-foreground">Documento</dt><dd className="mt-1 font-mono text-xs text-foreground">{formatTaxId(client.tax_id)}</dd></div>
                <div><dt className="text-xs font-medium text-muted-foreground">Unidades</dt><dd className="mt-1 text-foreground">{unitLabel(client.unitCount)}</dd></div>
              </dl>
              <p className="mt-3 text-xs text-muted-foreground">Atualizado em {formatDate(client.updated_at, timezone)}</p>
              <div className="mt-4 flex flex-wrap items-center gap-1 border-t border-border pt-3">
                <Link href={detailPath} className={buttonStyles({ variant: "ghost", size: "sm" })}><Eye aria-hidden="true" className="size-4" />Visualizar</Link>
                <Link href={`${detailPath}/editar`} className={buttonStyles({ variant: "ghost", size: "sm" })}><Pencil aria-hidden="true" className="size-4" />Editar</Link>
                <div className="ml-auto"><ClientStatusAction key={`${client.id}-${client.active}`} organizationSlug={organizationSlug} clientId={client.id} active={client.active} /></div>
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}
