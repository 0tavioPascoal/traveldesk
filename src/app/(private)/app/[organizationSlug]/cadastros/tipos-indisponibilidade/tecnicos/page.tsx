import Link from "next/link";

import { requireOrganizationRole } from "@/features/organizations/application/require-organization-role";
import { UnavailabilityTypeFilters } from "@/features/unavailabilities/components/unavailability-type-filters";
import { UnavailabilityTypeList } from "@/features/unavailabilities/components/unavailability-type-list";
import { UnavailabilityTypeTabs } from "@/features/unavailabilities/components/unavailability-type-tabs";
import { listTechnicianUnavailabilityTypes } from "@/features/unavailabilities/queries/list-technician-unavailability-types";
import { unavailabilityTypeFilterSchema } from "@/features/unavailabilities/schemas/unavailability-filter-schema";

type Props = { params: Promise<{ organizationSlug: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function TechnicianUnavailabilityTypesPage({ params, searchParams }: Props) {
  const { organizationSlug } = await params;
  const context = await requireOrganizationRole(organizationSlug, ["admin", "coordinator"] as const);
  const raw = await searchParams;
  const filters = unavailabilityTypeFilterSchema.parse(raw);
  const items = await listTechnicianUnavailabilityTypes(organizationSlug, filters);
  const path = `/app/${organizationSlug}/cadastros/tipos-indisponibilidade/tecnicos`;
  const feedback = typeof raw.feedback === "string" ? raw.feedback : null;
  return (
    <main className="min-h-screen bg-zinc-100 px-4 py-8 sm:px-6"><div className="mx-auto max-w-6xl space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><Link href={`/app/${organizationSlug}/dashboard`} className="text-sm font-medium text-zinc-600">← Voltar ao dashboard</Link><h1 className="mt-2 text-2xl font-bold">Tipos de indisponibilidade de técnicos</h1><p className="mt-1 text-sm text-zinc-600">Configure os motivos disponíveis para períodos de técnicos.</p></div><Link href={`${path}/novo`} className="inline-flex h-11 items-center justify-center rounded-lg bg-zinc-950 px-4 text-sm font-semibold text-white">Novo tipo</Link></header>
      {feedback === "created" || feedback === "updated" ? <p role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">Tipo {feedback === "created" ? "cadastrado" : "atualizado"} com sucesso.</p> : null}
      <UnavailabilityTypeTabs organizationSlug={organizationSlug} resource="technicians" />
      <section className="rounded-xl border border-zinc-200 bg-white p-5"><UnavailabilityTypeFilters path={path} filters={filters} /></section>
      <UnavailabilityTypeList organizationSlug={organizationSlug} resource="technicians" items={items} timezone={context.organization.timezone} hasFilters={Boolean(filters.query || filters.status !== "all")} />
    </div></main>
  );
}
