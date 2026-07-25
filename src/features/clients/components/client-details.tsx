import { Building2, FileText, Layers3 } from "lucide-react";

import { SectionHeader } from "@/components/page/section-header";
import type { ClientDetails as ClientDetailsType } from "@/features/clients/types/client";

type ClientDetailsProps = {
  client: ClientDetailsType;
};

function formatTaxId(value: string | null) {
  if (!value) return "Não informado";
  return value.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
}

export function ClientDetails({ client }: ClientDetailsProps) {
  return (
    <div className="space-y-6">
      <section aria-label="Resumo do cliente" className="grid overflow-hidden rounded-2xl border border-border bg-card sm:grid-cols-3">
        <div className="flex gap-3 border-b border-border p-4 sm:border-b-0 sm:border-r sm:p-5">
          <FileText aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-primary" />
          <div><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Documento</p><p className="mt-1 font-mono text-sm text-foreground">{formatTaxId(client.tax_id)}</p></div>
        </div>
        <div className="flex gap-3 border-b border-border p-4 sm:border-b-0 sm:border-r sm:p-5">
          <Building2 aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-primary" />
          <div><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Unidades</p><p className="mt-1 text-sm font-medium text-foreground">{client.unitCount === 0 ? "Nenhuma unidade" : `${client.unitCount} ${client.unitCount === 1 ? "unidade" : "unidades"}`}</p></div>
        </div>
        <div className="flex gap-3 p-4 sm:p-5">
          <Layers3 aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-primary" />
          <div><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Segmento</p><p className="mt-1 text-sm font-medium text-foreground">{client.segment ?? "Não informado"}</p></div>
        </div>
      </section>

      <section id="visao-geral" aria-labelledby="client-overview-title" className="rounded-2xl border border-border bg-card p-5 sm:p-6">
        <SectionHeader id="client-overview-title" title="Visão geral" description="Dados cadastrais e observações do cliente." />
        <dl className="mt-6 grid gap-x-8 gap-y-5 sm:grid-cols-2">
          <div><dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Razão social</dt><dd className="mt-1 text-sm text-foreground">{client.legal_name}</dd></div>
          <div><dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Nome fantasia</dt><dd className="mt-1 text-sm text-foreground">{client.trade_name ?? "Não informado"}</dd></div>
          <div><dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">CNPJ</dt><dd className="mt-1 font-mono text-sm text-foreground">{formatTaxId(client.tax_id)}</dd></div>
          <div><dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Situação</dt><dd className="mt-1 text-sm text-foreground">{client.active ? "Ativo" : "Inativo"}</dd></div>
          <div className="sm:col-span-2"><dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Observações</dt><dd className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{client.notes ?? "Nenhuma observação registrada."}</dd></div>
        </dl>
      </section>
    </div>
  );
}
