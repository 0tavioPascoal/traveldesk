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
import { UnavailabilityTypeStatusAction } from "@/features/unavailabilities/components/unavailability-type-status-action";
import type { UnavailabilityResourceKind, UnavailabilityTypeItem } from "@/features/unavailabilities/types/unavailability";

function formatUpdatedAt(value: string, timezone: string) {
  try {
    return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short", timeZone: timezone }).format(new Date(value));
  } catch {
    return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(value));
  }
}

export function UnavailabilityTypeList({ organizationSlug, resource, items, timezone, hasFilters }: { organizationSlug: string; resource: UnavailabilityResourceKind; items: UnavailabilityTypeItem[]; timezone: string; hasFilters: boolean }) {
  const technicians = resource === "technicians";
  const category = technicians ? "tecnicos" : "veiculos";
  const base = `/app/${organizationSlug}/cadastros/tipos-indisponibilidade/${category}`;
  if (items.length === 0) {
    return hasFilters ? <NoResultsState description="Revise a pesquisa ou limpe os filtros." action={{ href: base, label: "Limpar filtros" }} /> : <EmptyState title={technicians ? "Nenhum tipo para técnicos cadastrado" : "Nenhum tipo para veículos cadastrado"} description={technicians ? "Cadastre motivos como férias, folgas, treinamentos ou afastamentos." : "Cadastre motivos como manutenção, documentação ou bloqueios operacionais."} action={{ href: `${base}/novo`, label: technicians ? "Novo tipo para técnico" : "Novo tipo para veículo" }} />;
  }
  return (
    <>
      <DataTableShell>
        <table className={`${dataTableStyles} table-fixed`}>
          <thead className={dataTableHeaderStyles}><tr><th scope="col" className="w-1/4 px-4 py-3 font-semibold">Tipo</th><th scope="col" className="px-4 py-3 font-semibold">Descrição</th><th scope="col" className="w-28 px-4 py-3 font-semibold">Situação</th><th scope="col" className="w-40 px-4 py-3 font-semibold">Atualização</th><th scope="col" className="w-20 px-4 py-3 text-right font-semibold">Ações</th></tr></thead>
          <tbody className="divide-y divide-border">{items.map((item) => <tr key={item.id} className="transition-colors hover:bg-muted/40"><td className="px-4 py-3 font-semibold text-card-foreground">{item.name}</td><td className="px-4 py-3 text-muted-foreground"><p className="line-clamp-2" title={item.description ?? undefined}>{item.description ?? "Sem descrição"}</p></td><td className="px-4 py-3"><ActiveStatusBadge active={item.active} /></td><td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{formatUpdatedAt(item.updated_at, timezone)}</td><td className="px-4 py-3"><ListRowActions label={`Abrir ações do tipo ${item.name}`} title="Ações do tipo de indisponibilidade" description={item.name}><Link href={`${base}/${item.id}/editar`} className={listActionItemStyles}><Pencil aria-hidden="true" className="size-4" />Editar</Link><div className="[&>button]:min-h-11 [&>button]:w-full [&>button]:rounded-lg [&>button]:px-3 [&>button]:text-left [&>button]:no-underline [&>button:hover]:bg-muted"><UnavailabilityTypeStatusAction organizationSlug={organizationSlug} resource={resource} typeId={item.id} active={item.active} /></div></ListRowActions></td></tr>)}</tbody>
        </table>
      </DataTableShell>
      <MobileRecordList label={technicians ? "Tipos para técnicos" : "Tipos para veículos"}>{items.map((item) => <MobileRecordCard key={item.id}><div className="flex items-start justify-between gap-3"><h2 className="min-w-0 break-words font-semibold text-card-foreground">{item.name}</h2><ActiveStatusBadge active={item.active} /></div><p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground" title={item.description ?? undefined}>{item.description ?? "Sem descrição"}</p><p className="mt-3 text-xs text-subtle-foreground">Atualizado em {formatUpdatedAt(item.updated_at, timezone)}</p><div className="mt-4 flex justify-end border-t border-border pt-3"><ListRowActions label={`Abrir ações do tipo ${item.name}`} title="Ações do tipo de indisponibilidade" description={item.name}><Link href={`${base}/${item.id}/editar`} className={listActionItemStyles}><Pencil aria-hidden="true" className="size-4" />Editar</Link><div className="[&>button]:min-h-11 [&>button]:w-full [&>button]:rounded-lg [&>button]:px-3 [&>button]:text-left [&>button]:no-underline [&>button:hover]:bg-muted"><UnavailabilityTypeStatusAction organizationSlug={organizationSlug} resource={resource} typeId={item.id} active={item.active} /></div></ListRowActions></div></MobileRecordCard>)}</MobileRecordList>
    </>
  );
}
