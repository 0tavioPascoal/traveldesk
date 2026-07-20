import Link from "next/link";

import { requireOrganizationRole } from "@/features/organizations/application/require-organization-role";
import { UnavailabilityTypeTabs } from "@/features/unavailabilities/components/unavailability-type-tabs";

export default async function UnavailabilityTypesPage({ params }: { params: Promise<{ organizationSlug: string }> }) {
  const { organizationSlug } = await params;
  await requireOrganizationRole(organizationSlug, ["admin", "coordinator"] as const);
  const base = `/app/${organizationSlug}/cadastros/tipos-indisponibilidade`;
  return (
    <main className="min-h-screen bg-zinc-100 px-4 py-8 sm:px-6"><div className="mx-auto max-w-5xl space-y-6">
      <header><Link href={`/app/${organizationSlug}/dashboard`} className="text-sm font-medium text-zinc-600">← Voltar ao dashboard</Link><h1 className="mt-2 text-2xl font-bold">Tipos de indisponibilidade</h1><p className="mt-1 text-sm text-zinc-600">Configure motivos próprios para técnicos e veículos.</p></header>
      <UnavailabilityTypeTabs organizationSlug={organizationSlug} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Link href={`${base}/tecnicos`} className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:border-zinc-400"><h2 className="font-semibold">Tipos para técnicos</h2><p className="mt-1 text-sm text-zinc-600">Férias, folgas, treinamentos e outros períodos.</p></Link>
        <Link href={`${base}/veiculos`} className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:border-zinc-400"><h2 className="font-semibold">Tipos para veículos</h2><p className="mt-1 text-sm text-zinc-600">Manutenção, documentação e outros bloqueios.</p></Link>
      </div>
    </div></main>
  );
}
