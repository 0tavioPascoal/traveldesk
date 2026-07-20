import Link from "next/link";
import { TechnicianFilters } from "@/features/technicians/components/technician-filters";
import { TechnicianList } from "@/features/technicians/components/technician-list";
import { listTechnicians } from "@/features/technicians/queries/list-technicians";
import { technicianFilterSchema } from "@/features/technicians/schemas/technician-filter-schema";
import { requireOrganizationRole } from "@/features/organizations/application/require-organization-role";
import { listActiveSkills } from "@/features/skills/queries/list-active-skills";

type Props = { params: Promise<{ organizationSlug: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };
export default async function TechniciansPage({ params, searchParams }: Props) {
  const { organizationSlug } = await params;
  const context = await requireOrganizationRole(organizationSlug, ["admin", "coordinator"] as const);
  const filters = technicianFilterSchema.parse(await searchParams);
  const [technicians, skills] = await Promise.all([listTechnicians(organizationSlug, filters), listActiveSkills(organizationSlug)]);
  const hasFilters = Boolean(filters.query || filters.skillId || filters.baseState || filters.status !== "all" || filters.canDrive !== "all");
  return <main className="min-h-screen bg-zinc-100 px-4 py-8 sm:px-6"><div className="mx-auto max-w-7xl space-y-6"><header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><Link href={`/app/${organizationSlug}/dashboard`} className="text-sm font-medium text-zinc-600">← Voltar ao dashboard</Link><h1 className="mt-2 text-2xl font-bold">Técnicos</h1><p className="mt-1 text-sm text-zinc-600">Gerencie profissionais, especialidades e aptidão para condução.</p></div><Link href={`/app/${organizationSlug}/cadastros/tecnicos/novo`} className="inline-flex h-11 items-center justify-center rounded-lg bg-zinc-950 px-4 text-sm font-semibold text-white">Novo técnico</Link></header><section className="rounded-xl border border-zinc-200 bg-white p-5"><TechnicianFilters organizationSlug={organizationSlug} filters={filters} skills={skills} /></section><TechnicianList organizationSlug={organizationSlug} technicians={technicians} timezone={context.organization.timezone} hasFilters={hasFilters} /></div></main>;
}
