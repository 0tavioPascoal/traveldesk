import Link from "next/link";

import { ActiveStatusBadge } from "@/components/ui/active-status-badge";
import { buttonStyles } from "@/components/ui/button";
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
      <div className="hidden overflow-hidden rounded-2xl border border-border bg-card lg:block">
        <table className="w-full table-fixed text-left text-sm">
          <thead className="border-b border-border bg-muted/70 text-xs uppercase tracking-wide text-muted-foreground"><tr><th scope="col" className="w-1/4 px-4 py-3 font-semibold">Tipo</th><th scope="col" className="px-4 py-3 font-semibold">Descrição</th><th scope="col" className="w-28 px-4 py-3 font-semibold">Situação</th><th scope="col" className="w-40 px-4 py-3 font-semibold">Atualização</th><th scope="col" className="w-44 px-4 py-3 text-right font-semibold">Ações</th></tr></thead>
          <tbody className="divide-y divide-border">{items.map((item) => <tr key={item.id} className="transition-colors hover:bg-muted/40"><td className="px-4 py-3 font-semibold text-card-foreground">{item.name}</td><td className="px-4 py-3 text-muted-foreground"><p className="line-clamp-2" title={item.description ?? undefined}>{item.description ?? "Sem descrição"}</p></td><td className="px-4 py-3"><ActiveStatusBadge active={item.active} /></td><td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{formatUpdatedAt(item.updated_at, timezone)}</td><td className="px-4 py-3"><div className="flex items-center justify-end gap-4"><Link href={`${base}/${item.id}/editar`} className="text-sm font-semibold text-primary hover:underline">Editar</Link><UnavailabilityTypeStatusAction organizationSlug={organizationSlug} resource={resource} typeId={item.id} active={item.active} /></div></td></tr>)}</tbody>
        </table>
      </div>
      <div className="space-y-3 lg:hidden">{items.map((item) => <article key={item.id} className="rounded-2xl border border-border bg-card p-4"><div className="flex items-start justify-between gap-3"><h2 className="min-w-0 break-words font-semibold text-card-foreground">{item.name}</h2><ActiveStatusBadge active={item.active} /></div><p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground" title={item.description ?? undefined}>{item.description ?? "Sem descrição"}</p><p className="mt-3 text-xs text-subtle-foreground">Atualizado em {formatUpdatedAt(item.updated_at, timezone)}</p><div className="mt-4 flex items-center justify-end gap-4 border-t border-border pt-3"><Link href={`${base}/${item.id}/editar`} className={buttonStyles({ variant: "ghost", size: "sm" })}>Editar</Link><UnavailabilityTypeStatusAction organizationSlug={organizationSlug} resource={resource} typeId={item.id} active={item.active} /></div></article>)}</div>
    </>
  );
}
