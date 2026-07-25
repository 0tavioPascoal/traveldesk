import { Building2, Mail, MapPin, Pencil, Phone } from "lucide-react";
import Link from "next/link";

import { ActiveStatusBadge } from "@/components/ui/active-status-badge";
import { buttonStyles } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { NoResultsState } from "@/components/ui/no-results-state";
import { ClientUnitStatusAction } from "@/features/clients/components/client-unit-status-action";
import type { ClientUnit } from "@/features/clients/types/client";

type ClientUnitListProps = {
  organizationSlug: string;
  clientId: string;
  units: ClientUnit[];
  hasFilters: boolean;
  clientActive: boolean;
};

function formatPhone(value: string | null) {
  if (!value) return null;
  return value.length === 11 ? value.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3") : value.replace(/^(\d{2})(\d{4})(\d{4})$/, "($1) $2-$3");
}

function addressLines(unit: ClientUnit) {
  const street = [unit.address_line, unit.address_number].filter(Boolean).join(", ");
  const secondary = [unit.district, `${unit.city}/${unit.state}`].filter(Boolean).join(" • ");
  return [street || null, secondary].filter(Boolean);
}

export function ClientUnitList({ organizationSlug, clientId, units, hasFilters, clientActive }: ClientUnitListProps) {
  const detailPath = `/app/${organizationSlug}/cadastros/clientes/${clientId}`;
  const newPath = `${detailPath}/unidades/nova`;

  if (units.length === 0) {
    if (hasFilters) return <NoResultsState description="Revise os filtros ou limpe a pesquisa para encontrar outras unidades." action={{ href: `${detailPath}#unidades`, label: "Limpar filtros" }} />;
    return <EmptyState icon={Building2} title="Nenhuma unidade cadastrada" description={clientActive ? "Cadastre uma unidade para utilizá-la no planejamento das viagens." : "Ative o cliente antes de cadastrar uma nova unidade."} action={clientActive ? { href: newPath, label: "Nova unidade" } : undefined} />;
  }

  return (
    <>
      <div className="hidden overflow-hidden rounded-2xl border border-border md:block">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">Unidades vinculadas ao cliente</caption>
          <thead className="border-b border-border bg-muted/70 text-xs uppercase tracking-wide text-muted-foreground"><tr><th scope="col" className="px-5 py-3 font-semibold">Unidade</th><th scope="col" className="px-5 py-3 font-semibold">Endereço</th><th scope="col" className="px-5 py-3 font-semibold">Contato</th><th scope="col" className="px-5 py-3 font-semibold">Situação</th><th scope="col" className="px-5 py-3 text-right font-semibold">Ações</th></tr></thead>
          <tbody className="divide-y divide-border bg-card">
            {units.map((unit) => {
              const lines = addressLines(unit);
              const phone = formatPhone(unit.contact_phone);
              return (
                <tr key={unit.id} className="transition-colors hover:bg-muted/45 focus-within:bg-muted/45">
                  <td className="max-w-xs px-5 py-4"><p className="font-semibold text-foreground">{unit.name}</p>{unit.tax_id ? <p className="mt-1 font-mono text-xs text-muted-foreground">{unit.tax_id.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5")}</p> : null}</td>
                  <td className="px-5 py-4 text-muted-foreground">{lines.map((line) => <span key={line} className="block">{line}</span>)}</td>
                  <td className="px-5 py-4 text-muted-foreground"><span className="block text-foreground">{unit.contact_name ?? "Não informado"}</span>{phone ? <span className="mt-1 block text-xs">{phone}</span> : null}{unit.contact_email ? <span className="mt-1 block max-w-56 truncate text-xs">{unit.contact_email}</span> : null}</td>
                  <td className="px-5 py-4"><ActiveStatusBadge active={unit.active} feminine /></td>
                  <td className="px-5 py-4"><div className="flex items-center justify-end gap-1"><Link href={`${detailPath}/unidades/${unit.id}/editar`} aria-label={`Editar unidade ${unit.name}`} className={`${buttonStyles({ variant: "ghost", size: "sm" })} px-2`}><Pencil aria-hidden="true" className="size-4" /><span className="sr-only xl:not-sr-only">Editar</span></Link><ClientUnitStatusAction key={`${unit.id}-${unit.active}`} organizationSlug={organizationSlug} clientId={clientId} unitId={unit.id} active={unit.active} /></div></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="space-y-3 md:hidden" aria-label="Unidades vinculadas">
        {units.map((unit) => {
          const lines = addressLines(unit);
          const phone = formatPhone(unit.contact_phone);
          return (
            <article key={unit.id} className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-start justify-between gap-3"><div className="min-w-0"><h3 className="font-semibold text-card-foreground">{unit.name}</h3><p className="mt-1 text-sm text-muted-foreground">{unit.city}/{unit.state}</p></div><ActiveStatusBadge active={unit.active} feminine /></div>
              <div className="mt-4 space-y-3 text-sm text-muted-foreground">
                <div className="flex gap-2"><MapPin aria-hidden="true" className="mt-0.5 size-4 shrink-0" /><p>{lines.join(" · ")}</p></div>
                {unit.contact_name ? <div className="flex gap-2"><Building2 aria-hidden="true" className="mt-0.5 size-4 shrink-0" /><p>{unit.contact_name}</p></div> : null}
                {phone ? <div className="flex gap-2"><Phone aria-hidden="true" className="mt-0.5 size-4 shrink-0" /><p>{phone}</p></div> : null}
                {unit.contact_email ? <div className="flex min-w-0 gap-2"><Mail aria-hidden="true" className="mt-0.5 size-4 shrink-0" /><p className="truncate">{unit.contact_email}</p></div> : null}
              </div>
              <div className="mt-4 flex items-center gap-1 border-t border-border pt-3"><Link href={`${detailPath}/unidades/${unit.id}/editar`} className={buttonStyles({ variant: "ghost", size: "sm" })}><Pencil aria-hidden="true" className="size-4" />Editar</Link><div className="ml-auto"><ClientUnitStatusAction key={`${unit.id}-${unit.active}`} organizationSlug={organizationSlug} clientId={clientId} unitId={unit.id} active={unit.active} /></div></div>
            </article>
          );
        })}
      </div>
    </>
  );
}
