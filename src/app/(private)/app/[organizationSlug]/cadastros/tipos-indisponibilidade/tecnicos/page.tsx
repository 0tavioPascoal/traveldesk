import Link from "next/link";

import { PageContainer } from "@/components/page/page-container";
import { PageHeader } from "@/components/page/page-header";
import { SectionHeader } from "@/components/page/section-header";
import { buttonStyles } from "@/components/ui/button";
import { InlineAlert } from "@/components/ui/inline-alert";
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
    <PageContainer className="max-w-6xl space-y-6">
      <PageHeader title="Tipos de indisponibilidade" description="Configure os motivos utilizados para bloquear técnicos e veículos." breadcrumbs={[{ label: "Visão geral", href: `/app/${organizationSlug}/dashboard` }, { label: "Cadastros" }, { label: "Tipos de indisponibilidade" }]} actions={<Link href={`${path}/novo`} className={`${buttonStyles()} w-full sm:w-auto`}>Novo tipo para técnico</Link>} />
      {feedback === "created" || feedback === "updated" ? <InlineAlert tone="success">Tipo {feedback === "created" ? "cadastrado" : "atualizado"} com sucesso.</InlineAlert> : null}
      <UnavailabilityTypeTabs organizationSlug={organizationSlug} resource="technicians" />
      <SectionHeader title="Tipos para técnicos" description="Motivos utilizados para bloquear técnicos em novos planejamentos." />
      <section aria-label="Pesquisa e filtros" className="rounded-2xl border border-border bg-card p-5"><UnavailabilityTypeFilters path={path} filters={filters} /></section>
      <UnavailabilityTypeList organizationSlug={organizationSlug} resource="technicians" items={items} timezone={context.organization.timezone} hasFilters={Boolean(filters.query || filters.status !== "all")} />
    </PageContainer>
  );
}
