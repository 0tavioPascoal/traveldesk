import Link from "next/link";

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
    : "—";
}

function formatDate(value: string, timezone: string) {
  try {
    return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short", timeZone: timezone }).format(new Date(value));
  } catch {
    return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(value));
  }
}

function StatusBadge({ active }: { active: boolean }) {
  return <span className={active ? "rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800" : "rounded-full bg-zinc-200 px-2.5 py-1 text-xs font-semibold text-zinc-700"}>{active ? "Ativo" : "Inativo"}</span>;
}

export function ClientList({ organizationSlug, clients, timezone, hasFilters }: ClientListProps) {
  const newPath = `/app/${organizationSlug}/cadastros/clientes/novo`;

  if (clients.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-300 bg-white px-6 py-12 text-center">
        <h2 className="font-semibold text-zinc-950">{hasFilters ? "Nenhum cliente encontrado" : "Nenhum cliente cadastrado"}</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-zinc-600">{hasFilters ? "Altere ou limpe os filtros para visualizar outros clientes." : "Cadastre o primeiro cliente desta organização."}</p>
        {!hasFilters ? <Link href={newPath} className="mt-5 inline-flex h-10 items-center rounded-lg bg-zinc-950 px-4 text-sm font-semibold text-white">Novo cliente</Link> : null}
      </div>
    );
  }

  return (
    <>
      <div className="hidden overflow-x-auto rounded-xl border border-zinc-200 md:block">
        <table className="w-full min-w-[980px] text-left text-sm">
          <thead className="bg-zinc-50 text-xs uppercase tracking-wide text-zinc-600"><tr><th className="px-4 py-3">Cliente</th><th className="px-4 py-3">Nome fantasia</th><th className="px-4 py-3">CNPJ</th><th className="px-4 py-3">Unidades</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Atualizado em</th><th className="px-4 py-3">Ações</th></tr></thead>
          <tbody className="divide-y divide-zinc-200 bg-white">
            {clients.map((client) => (
              <tr key={client.id}>
                <td className="px-4 py-4 font-medium text-zinc-950">{client.legal_name}</td>
                <td className="px-4 py-4 text-zinc-600">{client.trade_name ?? "—"}</td>
                <td className="whitespace-nowrap px-4 py-4 text-zinc-600">{formatTaxId(client.tax_id)}</td>
                <td className="px-4 py-4 text-zinc-600">{client.unitCount}</td>
                <td className="px-4 py-4"><StatusBadge active={client.active} /></td>
                <td className="whitespace-nowrap px-4 py-4 text-zinc-600">{formatDate(client.updated_at, timezone)}</td>
                <td className="px-4 py-4"><div className="flex items-start gap-4"><Link href={`/app/${organizationSlug}/cadastros/clientes/${client.id}`} className="font-medium text-zinc-900">Abrir</Link><Link href={`/app/${organizationSlug}/cadastros/clientes/${client.id}/editar`} className="font-medium text-zinc-700">Editar</Link><ClientStatusAction organizationSlug={organizationSlug} clientId={client.id} active={client.active} /></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="space-y-3 md:hidden">
        {clients.map((client) => (
          <article key={client.id} className="rounded-xl border border-zinc-200 bg-white p-4">
            <div className="flex items-start justify-between gap-3"><div><h2 className="font-semibold text-zinc-950">{client.legal_name}</h2><p className="mt-1 text-sm text-zinc-600">{client.trade_name ?? "Sem nome fantasia"}</p></div><StatusBadge active={client.active} /></div>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm"><div><dt className="text-xs text-zinc-500">CNPJ</dt><dd className="mt-1 text-zinc-800">{formatTaxId(client.tax_id)}</dd></div><div><dt className="text-xs text-zinc-500">Unidades</dt><dd className="mt-1 text-zinc-800">{client.unitCount}</dd></div></dl>
            <p className="mt-3 text-xs text-zinc-500">Atualizado em {formatDate(client.updated_at, timezone)}</p>
            <div className="mt-4 flex items-start gap-4 border-t border-zinc-100 pt-3"><Link href={`/app/${organizationSlug}/cadastros/clientes/${client.id}`} className="text-sm font-medium text-zinc-900">Abrir</Link><Link href={`/app/${organizationSlug}/cadastros/clientes/${client.id}/editar`} className="text-sm font-medium text-zinc-700">Editar</Link><ClientStatusAction organizationSlug={organizationSlug} clientId={client.id} active={client.active} /></div>
          </article>
        ))}
      </div>
    </>
  );
}
