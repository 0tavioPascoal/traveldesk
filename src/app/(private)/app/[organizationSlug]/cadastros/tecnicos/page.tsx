import Link from "next/link";
import { PageContainer } from "@/components/page/page-container";
import { PageHeader } from "@/components/page/page-header";
import { buttonStyles } from "@/components/ui/button";
import { TechnicianFilters } from "@/features/technicians/components/technician-filters";
import { TechnicianList } from "@/features/technicians/components/technician-list";
import { TechnicianPagination } from "@/features/technicians/components/technician-pagination";
import { listTechnicians } from "@/features/technicians/queries/list-technicians";
import { technicianFilterSchema } from "@/features/technicians/schemas/technician-filter-schema";
import { requireOrganizationRole } from "@/features/organizations/application/require-organization-role";
import { listActiveSkills } from "@/features/skills/queries/list-active-skills";
import { dateInTimezone } from "@/features/technicians/application/technician-presentation";

type Props = { params: Promise<{ organizationSlug: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };
export default async function TechniciansPage({ params, searchParams }: Props) {
  const { organizationSlug } = await params;
  const context = await requireOrganizationRole(organizationSlug, ["admin", "coordinator"] as const);
  const filters = technicianFilterSchema.parse(await searchParams);
  const [result, skills] = await Promise.all([listTechnicians(organizationSlug, filters), listActiveSkills(organizationSlug)]);
  const hasFilters = Boolean(filters.query || filters.skillId || filters.baseState || filters.status !== "all" || filters.canDrive !== "all" || filters.page > 1);
  const referenceDate = dateInTimezone(new Date(), context.organization.timezone);
  return <PageContainer className="space-y-6"><PageHeader title="Técnicos" description="Gerencie os técnicos, suas especialidades e disponibilidade operacional." breadcrumbs={[{ label: "Visão geral", href: `/app/${organizationSlug}/dashboard` }, { label: "Cadastros" }, { label: "Técnicos" }]} actions={<Link href={`/app/${organizationSlug}/cadastros/tecnicos/novo`} className={buttonStyles()}>Novo técnico</Link>} /><section aria-label="Filtros de técnicos" className="rounded-2xl border border-border bg-card p-4 sm:p-5"><TechnicianFilters organizationSlug={organizationSlug} filters={filters} skills={skills} /></section><TechnicianList organizationSlug={organizationSlug} technicians={result.items} timezone={context.organization.timezone} referenceDate={referenceDate} hasFilters={hasFilters} /><TechnicianPagination organizationSlug={organizationSlug} filters={filters} total={result.total} totalPages={result.totalPages} pageSize={result.pageSize} /></PageContainer>;
}
