import Link from "next/link";
import { Search, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import type { TechnicianFilters as Values } from "@/features/technicians/types/technician";

export function TechnicianFilters({ organizationSlug, filters, skills }: { organizationSlug: string; filters: Values; skills: Array<{ id: string; name: string }> }) {
  const path = `/app/${organizationSlug}/cadastros/tecnicos`;
  const control = "h-11 w-full rounded-lg border border-input bg-card px-3 text-sm text-card-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/20";
  const selectedSkill = skills.find((skill) => skill.id === filters.skillId)?.name;
  const activeFilters = [
    filters.query ? `Busca: ${filters.query}` : null,
    filters.status === "active" ? "Situação: Ativos" : filters.status === "inactive" ? "Situação: Inativos" : null,
    selectedSkill ? `Especialidade: ${selectedSkill}` : null,
    filters.canDrive === "yes" ? "Autorizados a dirigir" : filters.canDrive === "no" ? "Não autorizados a dirigir" : null,
    filters.baseState ? `Localidade: ${filters.baseState}` : null,
  ].filter((value): value is string => Boolean(value));

  return <div className="space-y-4">
    <form action={path} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-[minmax(18rem,2fr)_1fr_1.2fr_1.15fr_7rem_auto] xl:items-end">
      <div className="space-y-1.5 sm:col-span-2 xl:col-span-1"><label htmlFor="query" className="text-sm font-medium text-foreground">Pesquisar técnico</label><div className="relative"><Search aria-hidden="true" className="pointer-events-none absolute left-3 top-3.5 size-4 text-muted-foreground" /><input id="query" name="query" type="search" defaultValue={filters.query} placeholder="Buscar por nome, documento ou e-mail..." className={`${control} pl-9`} /></div></div>
      <div className="space-y-1.5"><label htmlFor="status" className="text-sm font-medium text-foreground">Situação</label><select id="status" name="status" defaultValue={filters.status} className={control}><option value="all">Todos</option><option value="active">Ativos</option><option value="inactive">Inativos</option></select></div>
      <div className="space-y-1.5"><label htmlFor="skillId" className="text-sm font-medium text-foreground">Especialidade</label><select id="skillId" name="skillId" defaultValue={filters.skillId} className={control}><option value="">Todas</option>{skills.map((skill) => <option key={skill.id} value={skill.id}>{skill.name}</option>)}</select></div>
      <div className="space-y-1.5"><label htmlFor="canDrive" className="text-sm font-medium text-foreground">Autorização para dirigir</label><select id="canDrive" name="canDrive" defaultValue={filters.canDrive} className={control}><option value="all">Todos</option><option value="yes">Autorizados</option><option value="no">Não autorizados</option></select></div>
      <div className="space-y-1.5"><label htmlFor="baseState" className="text-sm font-medium text-foreground">UF-base</label><input id="baseState" name="baseState" maxLength={2} defaultValue={filters.baseState} placeholder="UF" className={`${control} uppercase`} /></div>
      <button className={buttonStyles()}>Aplicar</button>
    </form>
    {activeFilters.length > 0 ? <div className="flex flex-wrap items-center gap-2 border-t border-border pt-4"><span className="mr-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Filtros ativos</span>{activeFilters.map((label) => <Badge key={label} tone="primary">{label}</Badge>)}<Link href={path} className={`${buttonStyles({ variant: "ghost", size: "sm" })} ml-auto`}><X aria-hidden="true" className="size-4" />Limpar filtros</Link></div> : null}
  </div>;
}
