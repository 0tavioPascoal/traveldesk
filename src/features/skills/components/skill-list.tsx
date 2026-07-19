import Link from "next/link";

import { SkillStatusAction } from "@/features/skills/components/skill-status-action";
import type { Skill } from "@/features/skills/types/skill";

type SkillListProps = {
  organizationSlug: string;
  skills: Skill[];
  timezone: string;
  hasFilters: boolean;
};

function formatUpdatedAt(value: string, timezone: string) {
  const options: Intl.DateTimeFormatOptions = {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: timezone,
  };

  try {
    return new Intl.DateTimeFormat("pt-BR", options).format(new Date(value));
  } catch {
    return new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(value));
  }
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={
        active
          ? "inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800"
          : "inline-flex rounded-full bg-zinc-200 px-2.5 py-1 text-xs font-semibold text-zinc-700"
      }
    >
      {active ? "Ativo" : "Inativo"}
    </span>
  );
}

export function SkillList({
  organizationSlug,
  skills,
  timezone,
  hasFilters,
}: SkillListProps) {
  const newPath = `/app/${organizationSlug}/cadastros/especialidades/nova`;

  if (skills.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-300 px-6 py-12 text-center">
        <h2 className="text-base font-semibold text-zinc-950">
          {hasFilters
            ? "Nenhuma especialidade encontrada"
            : "Nenhuma especialidade cadastrada"}
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-zinc-600">
          {hasFilters
            ? "Altere ou limpe os filtros para visualizar outros registros."
            : "Cadastre a primeira especialidade técnica desta organização."}
        </p>
        {!hasFilters ? (
          <Link
            href={newPath}
            className="mt-5 inline-flex h-10 items-center justify-center rounded-lg bg-zinc-950 px-4 text-sm font-semibold text-white hover:bg-zinc-800"
          >
            Nova especialidade
          </Link>
        ) : null}
      </div>
    );
  }

  return (
    <>
      <div className="hidden overflow-x-auto rounded-xl border border-zinc-200 md:block">
        <table className="w-full min-w-[760px] border-collapse text-left text-sm">
          <thead className="bg-zinc-50 text-xs uppercase tracking-wide text-zinc-600">
            <tr>
              <th className="px-4 py-3 font-semibold">Nome</th>
              <th className="px-4 py-3 font-semibold">Descrição</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Atualizado em</th>
              <th className="px-4 py-3 font-semibold">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 bg-white">
            {skills.map((skill) => (
              <tr key={skill.id}>
                <td className="px-4 py-4 font-medium text-zinc-950">
                  {skill.name}
                </td>
                <td className="max-w-xs px-4 py-4 text-zinc-600">
                  {skill.description ?? "—"}
                </td>
                <td className="px-4 py-4">
                  <StatusBadge active={skill.active} />
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-zinc-600">
                  {formatUpdatedAt(skill.updated_at, timezone)}
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-start gap-4">
                    <Link
                      href={`/app/${organizationSlug}/cadastros/especialidades/${skill.id}/editar`}
                      className="text-sm font-medium text-zinc-800 hover:text-zinc-950"
                    >
                      Editar
                    </Link>
                    <SkillStatusAction
                      organizationSlug={organizationSlug}
                      skillId={skill.id}
                      active={skill.active}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 md:hidden">
        {skills.map((skill) => (
          <article
            key={skill.id}
            className="rounded-xl border border-zinc-200 bg-white p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <h2 className="font-semibold text-zinc-950">{skill.name}</h2>
              <StatusBadge active={skill.active} />
            </div>
            <p className="mt-3 text-sm leading-6 text-zinc-600">
              {skill.description ?? "Sem descrição."}
            </p>
            <p className="mt-3 text-xs text-zinc-500">
              Atualizado em {formatUpdatedAt(skill.updated_at, timezone)}
            </p>
            <div className="mt-4 flex items-start gap-4 border-t border-zinc-100 pt-3">
              <Link
                href={`/app/${organizationSlug}/cadastros/especialidades/${skill.id}/editar`}
                className="text-sm font-medium text-zinc-800"
              >
                Editar
              </Link>
              <SkillStatusAction
                organizationSlug={organizationSlug}
                skillId={skill.id}
                active={skill.active}
              />
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
