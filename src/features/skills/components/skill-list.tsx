import { Pencil } from "lucide-react";
import Link from "next/link";

import {
  DataTableShell,
  dataTableHeaderStyles,
  dataTableStyles,
} from "@/components/list-page/data-table-shell";
import {
  MobileRecordCard,
  MobileRecordList,
} from "@/components/list-page/mobile-record-list";
import {
  ListRowActions,
  listActionItemStyles,
} from "@/components/list-page/list-row-actions";
import { ActiveStatusBadge } from "@/components/ui/active-status-badge";
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
      <DataTableShell>
        <table className={`${dataTableStyles} table-fixed border-collapse`}>
          <thead className={dataTableHeaderStyles}>
            <tr><th scope="col" className="w-1/4 px-4 py-3 font-semibold">Especialidade</th><th scope="col" className="px-4 py-3 font-semibold">Descrição</th><th scope="col" className="w-28 px-4 py-3 font-semibold">Situação</th><th scope="col" className="w-40 px-4 py-3 font-semibold">Atualização</th><th scope="col" className="w-20 px-4 py-3 text-right font-semibold">Ações</th></tr>
          </thead>
          <tbody className="divide-y divide-border">
            {skills.map((skill) => (
              <tr key={skill.id} className="transition-colors hover:bg-muted/40">
                <td className="px-4 py-3 font-semibold text-card-foreground">{skill.name}</td>
                <td className="px-4 py-3 text-muted-foreground"><p className="line-clamp-2" title={skill.description ?? undefined}>{skill.description ?? "Sem descrição"}</p></td>
                <td className="px-4 py-3"><ActiveStatusBadge active={skill.active} feminine /></td>
                <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{formatUpdatedAt(skill.updated_at, timezone)}</td>
                <td className="px-4 py-3"><ListRowActions label={`Abrir ações da especialidade ${skill.name}`} title="Ações da especialidade" description={skill.name}><Link href={`${base}/${skill.id}/editar`} className={listActionItemStyles}><Pencil aria-hidden="true" className="size-4" />Editar</Link><div className="[&>button]:min-h-11 [&>button]:w-full [&>button]:rounded-lg [&>button]:px-3 [&>button]:text-left [&>button]:no-underline [&>button:hover]:bg-muted"><SkillStatusAction organizationSlug={organizationSlug} skillId={skill.id} active={skill.active} /></div></ListRowActions></td>
              </tr>
            ))}
          </tbody>
        </table>
      </DataTableShell>

      <MobileRecordList label="Especialidades cadastradas">
        {skills.map((skill) => (
          <MobileRecordCard key={skill.id}>
            <div className="flex items-start justify-between gap-3"><h2 className="min-w-0 break-words font-semibold text-card-foreground">{skill.name}</h2><ActiveStatusBadge active={skill.active} feminine /></div>
            <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground" title={skill.description ?? undefined}>{skill.description ?? "Sem descrição"}</p>
            <p className="mt-3 text-xs text-subtle-foreground">Atualizada em {formatUpdatedAt(skill.updated_at, timezone)}</p>
            <div className="mt-4 flex justify-end border-t border-border pt-3"><ListRowActions label={`Abrir ações da especialidade ${skill.name}`} title="Ações da especialidade" description={skill.name}><Link href={`${base}/${skill.id}/editar`} className={listActionItemStyles}><Pencil aria-hidden="true" className="size-4" />Editar</Link><div className="[&>button]:min-h-11 [&>button]:w-full [&>button]:rounded-lg [&>button]:px-3 [&>button]:text-left [&>button]:no-underline [&>button:hover]:bg-muted"><SkillStatusAction organizationSlug={organizationSlug} skillId={skill.id} active={skill.active} /></div></ListRowActions></div>
          </MobileRecordCard>
        ))}
      </MobileRecordList>
    </>
  );
}
