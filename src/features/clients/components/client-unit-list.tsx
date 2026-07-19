import Link from "next/link";

import { ClientUnitStatusAction } from "@/features/clients/components/client-unit-status-action";
import type { ClientUnit } from "@/features/clients/types/client";

type ClientUnitListProps = {
  organizationSlug: string;
  clientId: string;
  units: ClientUnit[];
  hasFilters: boolean;
  clientActive: boolean;
};

function formatTaxId(value: string | null) {
  return value ? value.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5") : "—";
}

function formatPhone(value: string | null) {
  if (!value) return null;
  return value.length === 11
    ? value.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3")
    : value.replace(/^(\d{2})(\d{4})(\d{4})$/, "($1) $2-$3");
}

function StatusBadge({ active }: { active: boolean }) {
  return <span className={active ? "rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800" : "rounded-full bg-zinc-200 px-2.5 py-1 text-xs font-semibold text-zinc-700"}>{active ? "Ativa" : "Inativa"}</span>;
}

export function ClientUnitList({ organizationSlug, clientId, units, hasFilters, clientActive }: ClientUnitListProps) {
  const newPath = `/app/${organizationSlug}/cadastros/clientes/${clientId}/unidades/nova`;

  if (units.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-300 px-6 py-10 text-center">
        <h3 className="font-semibold text-zinc-950">{hasFilters ? "Nenhuma unidade encontrada" : "Nenhuma unidade cadastrada"}</h3>
        <p className="mx-auto mt-2 max-w-md text-sm text-zinc-600">{hasFilters ? "Altere ou limpe os filtros para visualizar outras unidades." : clientActive ? "Cadastre a primeira unidade deste cliente." : "Ative o cliente antes de cadastrar uma unidade."}</p>
        {!hasFilters && clientActive ? <Link href={newPath} className="mt-5 inline-flex h-10 items-center rounded-lg bg-zinc-950 px-4 text-sm font-semibold text-white">Nova unidade</Link> : null}
      </div>
    );
  }

  return (
    <>
      <div className="hidden overflow-x-auto rounded-xl border border-zinc-200 md:block">
        <table className="w-full min-w-[850px] text-left text-sm">
          <thead className="bg-zinc-50 text-xs uppercase tracking-wide text-zinc-600"><tr><th className="px-4 py-3">Unidade</th><th className="px-4 py-3">Cidade/UF</th><th className="px-4 py-3">CNPJ</th><th className="px-4 py-3">Contato</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Ações</th></tr></thead>
          <tbody className="divide-y divide-zinc-200 bg-white">
            {units.map((unit) => (
              <tr key={unit.id}><td className="px-4 py-4 font-medium text-zinc-950">{unit.name}</td><td className="px-4 py-4 text-zinc-600">{unit.city}/{unit.state}</td><td className="whitespace-nowrap px-4 py-4 text-zinc-600">{formatTaxId(unit.tax_id)}</td><td className="px-4 py-4 text-zinc-600"><span className="block">{unit.contact_name ?? "—"}</span>{formatPhone(unit.contact_phone) ? <span className="block text-xs">{formatPhone(unit.contact_phone)}</span> : null}</td><td className="px-4 py-4"><StatusBadge active={unit.active} /></td><td className="px-4 py-4"><div className="flex items-start gap-4"><Link href={`/app/${organizationSlug}/cadastros/clientes/${clientId}/unidades/${unit.id}/editar`} className="font-medium text-zinc-800">Editar</Link><ClientUnitStatusAction organizationSlug={organizationSlug} clientId={clientId} unitId={unit.id} active={unit.active} /></div></td></tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="space-y-3 md:hidden">
        {units.map((unit) => (
          <article key={unit.id} className="rounded-xl border border-zinc-200 bg-white p-4"><div className="flex items-start justify-between gap-3"><div><h3 className="font-semibold text-zinc-950">{unit.name}</h3><p className="mt-1 text-sm text-zinc-600">{unit.city}/{unit.state}</p></div><StatusBadge active={unit.active} /></div><dl className="mt-4 grid grid-cols-2 gap-3 text-sm"><div><dt className="text-xs text-zinc-500">CNPJ</dt><dd className="mt-1">{formatTaxId(unit.tax_id)}</dd></div><div><dt className="text-xs text-zinc-500">Contato</dt><dd className="mt-1">{unit.contact_name ?? "—"}</dd></div></dl><div className="mt-4 flex items-start gap-4 border-t border-zinc-100 pt-3"><Link href={`/app/${organizationSlug}/cadastros/clientes/${clientId}/unidades/${unit.id}/editar`} className="text-sm font-medium text-zinc-800">Editar</Link><ClientUnitStatusAction organizationSlug={organizationSlug} clientId={clientId} unitId={unit.id} active={unit.active} /></div></article>
        ))}
      </div>
    </>
  );
}
