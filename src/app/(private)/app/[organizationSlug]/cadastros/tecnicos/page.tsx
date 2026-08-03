import { Plus } from "lucide-react";
import Link from "next/link";
import { ColumnVisibilityMenu } from "@/components/list-page/column-visibility-menu";
import { ListPageContent, ListPageFooter, ListPageShell } from "@/components/list-page/list-page-shell";
import { ListToolbar } from "@/components/list-page/list-toolbar";
import { RefreshListButton } from "@/components/list-page/refresh-list-button";
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
  return <ListPageShell><PageHeader title="Técnicos" description="Gerencie os técnicos, suas especialidades e disponibilidade operacional." breadcrumbs={[{ label: "Cadastros" }, { label: "Técnicos" }]} /><ListToolbar actions={<><Link href={`/app/${organizationSlug}/cadastros/tecnicos/novo`} className={buttonStyles({ size: "sm" })}><Plus aria-hidden="true" className="size-4" />Novo técnico</Link><RefreshListButton /></>} columnControl={<ColumnVisibilityMenu listKey="technicians" columns={[{ key: "base", label: "Localidade-base" }, { key: "skills", label: "Especialidades" }, { key: "license", label: "Habilitação" }, { key: "availability", label: "Disponibilidade" }]} />}><TechnicianFilters organizationSlug={organizationSlug} filters={filters} skills={skills} /></ListToolbar><ListPageContent><TechnicianList organizationSlug={organizationSlug} technicians={result.items} timezone={context.organization.timezone} referenceDate={referenceDate} hasFilters={hasFilters} /></ListPageContent><ListPageFooter><TechnicianPagination organizationSlug={organizationSlug} filters={filters} total={result.total} totalPages={result.totalPages} pageSize={result.pageSize} /></ListPageFooter></ListPageShell>;
}
