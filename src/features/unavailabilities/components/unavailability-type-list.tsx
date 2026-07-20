import Link from "next/link";

import { UnavailabilityTypeStatusAction } from "@/features/unavailabilities/components/unavailability-type-status-action";
import type { UnavailabilityResourceKind, UnavailabilityTypeItem } from "@/features/unavailabilities/types/unavailability";

function formatUpdatedAt(value: string, timezone: string) {
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short", timeZone: timezone }).format(new Date(value));
}

export function UnavailabilityTypeList({
  organizationSlug,
  resource,
  items,
  timezone,
  hasFilters,
}: {
  organizationSlug: string;
  resource: UnavailabilityResourceKind;
  items: UnavailabilityTypeItem[];
  timezone: string;
  hasFilters: boolean;
}) {
  const category = resource === "technicians" ? "tecnicos" : "veiculos";
  const base = `/app/${organizationSlug}/cadastros/tipos-indisponibilidade/${category}`;
  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-10 text-center">
        <h2 className="font-semibold">{hasFilters ? "Nenhum tipo encontrado" : "Nenhum tipo cadastrado"}</h2>
        <p className="mt-2 text-sm text-zinc-600">{hasFilters ? "Altere ou limpe os filtros." : "Cadastre o primeiro tipo desta categoria."}</p>
        {!hasFilters ? <Link href={`${base}/novo`} className="mt-4 inline-flex h-10 items-center rounded-lg bg-zinc-950 px-4 text-sm font-semibold text-white">Novo tipo</Link> : null}
      </div>
    );
  }
  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-left">
          <thead className="bg-zinc-50 text-xs uppercase text-zinc-600"><tr><th className="px-4 py-3">Nome</th><th className="px-4 py-3">Descrição</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Atualizado em</th><th className="px-4 py-3">Ações</th></tr></thead>
          <tbody className="divide-y">{items.map((item) => <tr key={item.id}><td className="px-4 py-4 font-semibold">{item.name}</td><td className="max-w-md px-4 py-4 text-sm text-zinc-600">{item.description ?? "—"}</td><td className="px-4 py-4"><span className={item.active ? "rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800" : "rounded-full bg-zinc-200 px-2.5 py-1 text-xs font-semibold text-zinc-700"}>{item.active ? "Ativo" : "Inativo"}</span></td><td className="whitespace-nowrap px-4 py-4 text-sm text-zinc-600">{formatUpdatedAt(item.updated_at, timezone)}</td><td className="px-4 py-4"><div className="flex items-start gap-3"><Link href={`${base}/${item.id}/editar`} className="text-sm font-medium">Editar</Link><UnavailabilityTypeStatusAction organizationSlug={organizationSlug} resource={resource} typeId={item.id} active={item.active} /></div></td></tr>)}</tbody>
        </table>
      </div>
      <div className="divide-y md:hidden">{items.map((item) => <article key={item.id} className="space-y-3 p-4"><div className="flex items-start justify-between gap-3"><h2 className="font-semibold">{item.name}</h2><span className={item.active ? "rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800" : "rounded-full bg-zinc-200 px-2.5 py-1 text-xs font-semibold text-zinc-700"}>{item.active ? "Ativo" : "Inativo"}</span></div><p className="text-sm text-zinc-600">{item.description ?? "Sem descrição"}</p><div className="flex gap-3 border-t pt-3"><Link href={`${base}/${item.id}/editar`} className="text-sm font-medium">Editar</Link><UnavailabilityTypeStatusAction organizationSlug={organizationSlug} resource={resource} typeId={item.id} active={item.active} /></div></article>)}</div>
    </div>
  );
}
