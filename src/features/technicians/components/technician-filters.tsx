import Link from "next/link";
import type { TechnicianFilters as Values } from "@/features/technicians/types/technician";

export function TechnicianFilters({ organizationSlug, filters, skills }: { organizationSlug: string; filters: Values; skills: Array<{ id: string; name: string }> }) {
  const path = `/app/${organizationSlug}/cadastros/tecnicos`;
  const select = "h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm";
  return <form action={path} className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
    <div className="space-y-1 lg:col-span-2"><label htmlFor="query" className="text-sm font-medium">Pesquisar</label><input id="query" name="query" type="search" defaultValue={filters.query} placeholder="Nome, CPF, e-mail, telefone ou cidade" className={select} /></div>
    <div className="space-y-1"><label htmlFor="status" className="text-sm font-medium">Status</label><select id="status" name="status" defaultValue={filters.status} className={select}><option value="all">Todos</option><option value="active">Ativos</option><option value="inactive">Inativos</option></select></div>
    <div className="space-y-1"><label htmlFor="skillId" className="text-sm font-medium">Especialidade</label><select id="skillId" name="skillId" defaultValue={filters.skillId} className={select}><option value="">Todas</option>{skills.map((skill) => <option key={skill.id} value={skill.id}>{skill.name}</option>)}</select></div>
    <div className="space-y-1"><label htmlFor="canDrive" className="text-sm font-medium">Pode dirigir</label><select id="canDrive" name="canDrive" defaultValue={filters.canDrive} className={select}><option value="all">Todos</option><option value="yes">Sim</option><option value="no">Não</option></select></div>
    <div className="space-y-1"><label htmlFor="baseState" className="text-sm font-medium">UF</label><input id="baseState" name="baseState" maxLength={2} defaultValue={filters.baseState} placeholder="UF" className={select} /></div>
    <div className="flex items-end gap-2 lg:col-span-4"><button className="h-10 rounded-lg bg-zinc-900 px-4 text-sm font-semibold text-white">Filtrar</button><Link href={path} className="inline-flex h-10 items-center rounded-lg border border-zinc-300 px-4 text-sm font-semibold">Limpar</Link></div>
  </form>;
}
