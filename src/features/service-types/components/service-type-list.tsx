import { Pencil } from "lucide-react";
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
import { ServiceTypeStatusAction } from "@/features/service-types/components/service-type-status-action";
import type { ServiceType } from "@/features/service-types/types/service-type";

type ServiceTypeListProps = { organizationSlug: string; serviceTypes: ServiceType[]; timezone: string; hasFilters: boolean };

function formatUpdatedAt(value: string, timezone: string) {
  try {
    return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short", timeZone: timezone }).format(new Date(value));
  } catch {
    return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(value));
  }
}

export function ServiceTypeList({ organizationSlug, serviceTypes, timezone, hasFilters }: ServiceTypeListProps) {
  const base = `/app/${organizationSlug}/cadastros/tipos-atendimento`;
  if (serviceTypes.length === 0) {
    return hasFilters ? <NoResultsState description="Revise a pesquisa ou limpe os filtros." action={{ href: base, label: "Limpar filtros" }} /> : <EmptyState title="Nenhum tipo de atendimento cadastrado" description="Cadastre as categorias utilizadas para classificar os atendimentos técnicos." action={{ href: `${base}/novo`, label: "Novo tipo de atendimento" }} />;
  }

  return (
    <>
      <DataTableShell>
        <table className={`${dataTableStyles} table-fixed border-collapse`}>
          <thead className={dataTableHeaderStyles}><tr><th scope="col" className="w-1/4 px-4 py-3 font-semibold">Tipo de atendimento</th><th scope="col" className="px-4 py-3 font-semibold">Descrição</th><th scope="col" className="w-28 px-4 py-3 font-semibold">Situação</th><th scope="col" className="w-40 px-4 py-3 font-semibold">Atualização</th><th scope="col" className="w-20 px-4 py-3 text-right font-semibold">Ações</th></tr></thead>
          <tbody className="divide-y divide-border">{serviceTypes.map((item) => <tr key={item.id} className="transition-colors hover:bg-muted/40"><td className="px-4 py-3 font-semibold text-card-foreground">{item.name}</td><td className="px-4 py-3 text-muted-foreground"><p className="line-clamp-2" title={item.description ?? undefined}>{item.description ?? "Sem descrição"}</p></td><td className="px-4 py-3"><ActiveStatusBadge active={item.active} /></td><td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{formatUpdatedAt(item.updated_at, timezone)}</td><td className="px-4 py-3"><ListRowActions label={`Abrir ações do tipo ${item.name}`} title="Ações do tipo de atendimento" description={item.name}><Link href={`${base}/${item.id}/editar`} className={listActionItemStyles}><Pencil aria-hidden="true" className="size-4" />Editar</Link><div className="[&>button]:min-h-11 [&>button]:w-full [&>button]:rounded-lg [&>button]:px-3 [&>button]:text-left [&>button]:no-underline [&>button:hover]:bg-muted"><ServiceTypeStatusAction organizationSlug={organizationSlug} serviceTypeId={item.id} active={item.active} /></div></ListRowActions></td></tr>)}</tbody>
        </table>
      </DataTableShell>
      <MobileRecordList label="Tipos de atendimento cadastrados">{serviceTypes.map((item) => <MobileRecordCard key={item.id}><div className="flex items-start justify-between gap-3"><h2 className="min-w-0 break-words font-semibold text-card-foreground">{item.name}</h2><ActiveStatusBadge active={item.active} /></div><p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground" title={item.description ?? undefined}>{item.description ?? "Sem descrição"}</p><p className="mt-3 text-xs text-subtle-foreground">Atualizado em {formatUpdatedAt(item.updated_at, timezone)}</p><div className="mt-4 flex justify-end border-t border-border pt-3"><ListRowActions label={`Abrir ações do tipo ${item.name}`} title="Ações do tipo de atendimento" description={item.name}><Link href={`${base}/${item.id}/editar`} className={listActionItemStyles}><Pencil aria-hidden="true" className="size-4" />Editar</Link><div className="[&>button]:min-h-11 [&>button]:w-full [&>button]:rounded-lg [&>button]:px-3 [&>button]:text-left [&>button]:no-underline [&>button:hover]:bg-muted"><ServiceTypeStatusAction organizationSlug={organizationSlug} serviceTypeId={item.id} active={item.active} /></div></ListRowActions></div></MobileRecordCard>)}</MobileRecordList>
    </>
  );
}
