import Link from "next/link";

import { ClientStatusAction } from "@/features/clients/components/client-status-action";
import type { ClientDetails as ClientDetailsType } from "@/features/clients/types/client";

type ClientDetailsProps = {
  organizationSlug: string;
  client: ClientDetailsType;
};

function formatTaxId(value: string | null) {
  if (!value) return "Não informado";
  return value.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
}

export function ClientDetails({ organizationSlug, client }: ClientDetailsProps) {
  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-zinc-950">{client.legal_name}</h1>
            <span className={client.active ? "rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800" : "rounded-full bg-zinc-200 px-2.5 py-1 text-xs font-semibold text-zinc-700"}>{client.active ? "Ativo" : "Inativo"}</span>
          </div>
          {client.trade_name ? <p className="mt-1 text-sm text-zinc-600">{client.trade_name}</p> : null}
        </div>
        <div className="flex flex-wrap items-start gap-4">
          <Link href={`/app/${organizationSlug}/cadastros/clientes/${client.id}/editar`} className="text-sm font-semibold text-zinc-800 hover:text-zinc-950">Editar cliente</Link>
          <ClientStatusAction organizationSlug={organizationSlug} clientId={client.id} active={client.active} />
        </div>
      </div>
      <dl className="mt-6 grid gap-5 border-t border-zinc-100 pt-5 sm:grid-cols-3">
        <div><dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">CNPJ</dt><dd className="mt-1 text-sm text-zinc-900">{formatTaxId(client.tax_id)}</dd></div>
        <div><dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">Segmento</dt><dd className="mt-1 text-sm text-zinc-900">{client.segment ?? "Não informado"}</dd></div>
        <div className="sm:col-span-3"><dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">Observações</dt><dd className="mt-1 whitespace-pre-wrap text-sm leading-6 text-zinc-700">{client.notes ?? "Sem observações."}</dd></div>
      </dl>
    </section>
  );
}
