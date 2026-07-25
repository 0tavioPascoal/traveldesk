import Link from "next/link";

import { ActiveStatusBadge } from "@/components/ui/active-status-badge";
import { buttonStyles } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { NoResultsState } from "@/components/ui/no-results-state";
import { SkillStatusAction } from "@/features/skills/components/skill-status-action";
import type { Skill } from "@/features/skills/types/skill";

type SkillListProps = {
  organizationSlug: string;
  skills: Skill[];
  timezone: string;
  hasFilters: boolean;
};

function formatUpdatedAt(value: string, timezone: string) {
  try {
    return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short", timeZone: timezone }).format(new Date(value));
  } catch {
    return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(value));
  }
}

export function SkillList({ organizationSlug, skills, timezone, hasFilters }: SkillListProps) {
  const base = `/app/${organizationSlug}/cadastros/especialidades`;

  if (skills.length === 0) {
    return hasFilters ? (
      <NoResultsState description="Revise a pesquisa ou limpe os filtros." action={{ href: base, label: "Limpar filtros" }} />
    ) : (
      <EmptyState title="Nenhuma especialidade cadastrada" description="Cadastre competências para utilizá-las nos técnicos e requisitos das viagens." action={{ href: `${base}/nova`, label: "Nova especialidade" }} />
    );
  }

  return (
    <>
      <div className="hidden overflow-hidden rounded-2xl border border-border bg-card lg:block">
        <table className="w-full table-fixed border-collapse text-left text-sm">
          <thead className="border-b border-border bg-muted/70 text-xs uppercase tracking-wide text-muted-foreground">
            <tr><th scope="col" className="w-1/4 px-4 py-3 font-semibold">Especialidade</th><th scope="col" className="px-4 py-3 font-semibold">Descrição</th><th scope="col" className="w-28 px-4 py-3 font-semibold">Situação</th><th scope="col" className="w-40 px-4 py-3 font-semibold">Atualização</th><th scope="col" className="w-44 px-4 py-3 text-right font-semibold">Ações</th></tr>
          </thead>
          <tbody className="divide-y divide-border">
            {skills.map((skill) => (
              <tr key={skill.id} className="transition-colors hover:bg-muted/40">
                <td className="px-4 py-3 font-semibold text-card-foreground">{skill.name}</td>
                <td className="px-4 py-3 text-muted-foreground"><p className="line-clamp-2" title={skill.description ?? undefined}>{skill.description ?? "Sem descrição"}</p></td>
                <td className="px-4 py-3"><ActiveStatusBadge active={skill.active} feminine /></td>
                <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{formatUpdatedAt(skill.updated_at, timezone)}</td>
                <td className="px-4 py-3"><div className="flex items-center justify-end gap-4"><Link href={`${base}/${skill.id}/editar`} className="text-sm font-semibold text-primary hover:underline">Editar</Link><SkillStatusAction organizationSlug={organizationSlug} skillId={skill.id} active={skill.active} /></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 lg:hidden">
        {skills.map((skill) => (
          <article key={skill.id} className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-start justify-between gap-3"><h2 className="min-w-0 break-words font-semibold text-card-foreground">{skill.name}</h2><ActiveStatusBadge active={skill.active} feminine /></div>
            <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground" title={skill.description ?? undefined}>{skill.description ?? "Sem descrição"}</p>
            <p className="mt-3 text-xs text-subtle-foreground">Atualizada em {formatUpdatedAt(skill.updated_at, timezone)}</p>
            <div className="mt-4 flex items-center justify-end gap-4 border-t border-border pt-3"><Link href={`${base}/${skill.id}/editar`} className={buttonStyles({ variant: "ghost", size: "sm" })}>Editar</Link><SkillStatusAction organizationSlug={organizationSlug} skillId={skill.id} active={skill.active} /></div>
          </article>
        ))}
      </div>
    </>
  );
}
