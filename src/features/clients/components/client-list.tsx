import { Building2, Eye, Pencil } from "lucide-react";
import Link from "next/link";

import {
  DataTableShell,
  dataTableHeaderStyles,
  dataTableStyles,
} from "@/components/list-page/data-table-shell";
import {
  MobileRecordCard,
  MobileRecordList,
} from "@/components/list-page/mobile-record-list";
import {
  ListRowActions,
  listActionItemStyles,
} from "@/components/list-page/list-row-actions";
import { ActiveStatusBadge } from "@/components/ui/active-status-badge";
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
      <DataTableShell>
        <table className={dataTableStyles}>
          <caption className="sr-only">Clientes cadastrados na organização</caption>
          <thead className={dataTableHeaderStyles}>
            <tr>
              <th scope="col" className="px-5 py-3 font-semibold">Cliente</th>
              <th data-list-column="clients:document" scope="col" className="px-5 py-3 font-semibold">Documento</th>
              <th data-list-column="clients:units" scope="col" className="px-5 py-3 font-semibold">Unidades</th>
              <th scope="col" className="px-5 py-3 font-semibold">Situação</th>
              <th data-list-column="clients:updatedAt" scope="col" className="px-5 py-3 font-semibold">Atualização</th>
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
                  <td data-list-column="clients:document" className="whitespace-nowrap px-5 py-4 font-mono text-xs text-muted-foreground">{formatTaxId(client.tax_id)}</td>
                  <td data-list-column="clients:units" className="px-5 py-4 text-muted-foreground">
                    <span className="inline-flex items-center gap-2"><Building2 aria-hidden="true" className="size-4" />{unitLabel(client.unitCount)}</span>
                  </td>
                  <td className="px-5 py-4"><ActiveStatusBadge active={client.active} /></td>
                  <td data-list-column="clients:updatedAt" className="whitespace-nowrap px-5 py-4 text-muted-foreground">{formatDate(client.updated_at, timezone)}</td>
                  <td className="px-5 py-4">
                    <ListRowActions label={`Abrir ações de ${client.legal_name}`} title="Ações do cliente" description={client.legal_name}>
                      <Link href={detailPath} className={listActionItemStyles}><Eye aria-hidden="true" className="size-4" />Visualizar</Link>
                      <Link href={`${detailPath}/editar`} className={listActionItemStyles}><Pencil aria-hidden="true" className="size-4" />Editar</Link>
                      <div className="[&>button]:min-h-11 [&>button]:w-full [&>button]:px-3 [&>button]:text-left [&>button]:no-underline [&>button:hover]:bg-muted"><ClientStatusAction key={`${client.id}-${client.active}`} organizationSlug={organizationSlug} clientId={client.id} active={client.active} /></div>
                    </ListRowActions>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </DataTableShell>

      <MobileRecordList label="Clientes cadastrados">
        {clients.map((client) => {
          const detailPath = `${listPath}/${client.id}`;
          return (
            <MobileRecordCard key={client.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <Link href={detailPath} className="font-semibold text-card-foreground hover:text-primary hover:underline">{client.legal_name}</Link>
                  <p className="mt-1 truncate text-sm text-muted-foreground">{client.trade_name ?? "Sem nome fantasia"}</p>
                </div>
                <ActiveStatusBadge active={client.active} />
              </div>
              <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                <div data-list-column="clients:document"><dt className="text-xs font-medium text-muted-foreground">Documento</dt><dd className="mt-1 font-mono text-xs text-foreground">{formatTaxId(client.tax_id)}</dd></div>
                <div data-list-column="clients:units"><dt className="text-xs font-medium text-muted-foreground">Unidades</dt><dd className="mt-1 text-foreground">{unitLabel(client.unitCount)}</dd></div>
              </dl>
              <p data-list-column="clients:updatedAt" className="mt-3 text-xs text-muted-foreground">Atualizado em {formatDate(client.updated_at, timezone)}</p>
              <div className="mt-4 flex justify-end border-t border-border pt-3">
                <ListRowActions label={`Abrir ações de ${client.legal_name}`} title="Ações do cliente" description={client.legal_name}>
                  <Link href={detailPath} className={listActionItemStyles}><Eye aria-hidden="true" className="size-4" />Visualizar</Link>
                  <Link href={`${detailPath}/editar`} className={listActionItemStyles}><Pencil aria-hidden="true" className="size-4" />Editar</Link>
                  <div className="[&>button]:min-h-11 [&>button]:w-full [&>button]:px-3 [&>button]:text-left [&>button]:no-underline [&>button:hover]:bg-muted"><ClientStatusAction key={`${client.id}-${client.active}`} organizationSlug={organizationSlug} clientId={client.id} active={client.active} /></div>
                </ListRowActions>
              </div>
            </MobileRecordCard>
          );
        })}
      </MobileRecordList>
    </>
  );
}
