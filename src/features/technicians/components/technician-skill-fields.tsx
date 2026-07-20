"use client";

import { useState } from "react";

import type { TechnicianFormSkillValue } from "@/features/technicians/types/technician";

type SkillOption = { id: string; name: string; active: boolean };
type Props = { options: SkillOption[]; initialValues: TechnicianFormSkillValue[]; disabled: boolean; error?: string };

export function TechnicianSkillFields({ options, initialValues, disabled, error }: Props) {
  const [rows, setRows] = useState(() => initialValues);
  const selectedIds = new Set(rows.map((row) => row.skillId));
  const update = (index: number, values: Partial<TechnicianFormSkillValue>) =>
    setRows((current) => current.map((row, rowIndex) => rowIndex === index ? { ...row, ...values } : row));

  return (
    <fieldset className="space-y-4 rounded-xl border border-zinc-200 p-4">
      <div>
        <legend className="font-semibold text-zinc-950">Especialidades</legend>
        <p className="mt-1 text-sm text-zinc-600">Associe áreas de conhecimento, nível e uma especialidade principal opcional.</p>
      </div>
      {rows.length === 0 ? <p className="text-sm text-zinc-500">Nenhuma especialidade associada.</p> : null}
      <div className="space-y-3">
        {rows.map((row, index) => (
          <div key={`${row.skillId}-${index}`} className="grid gap-3 rounded-lg bg-zinc-50 p-3 sm:grid-cols-[1fr_10rem_auto_auto] sm:items-end">
            <div className="space-y-1">
              <label htmlFor={`skill-${index}`} className="text-sm font-medium text-zinc-800">Especialidade</label>
              <select id={`skill-${index}`} name="skillId" value={row.skillId} disabled={disabled} onChange={(event) => update(index, { skillId: event.target.value, isPrimary: false })} className="h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm">
                <option value="">Selecione</option>
                {options.map((option) => <option key={option.id} value={option.id} disabled={!option.active || (selectedIds.has(option.id) && option.id !== row.skillId)}>{option.name}{option.active ? "" : " (inativa)"}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label htmlFor={`level-${index}`} className="text-sm font-medium text-zinc-800">Nível</label>
              <select id={`level-${index}`} name="proficiencyLevel" value={row.proficiencyLevel} disabled={disabled} onChange={(event) => update(index, { proficiencyLevel: event.target.value })} className="h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm">
                <option value="1">1 — Básico</option><option value="2">2 — Júnior</option><option value="3">3 — Intermediário</option><option value="4">4 — Avançado</option><option value="5">5 — Especialista</option>
              </select>
            </div>
            <label className="flex h-10 items-center gap-2 text-sm text-zinc-700">
              <input type="radio" name="primarySkillId" value={row.skillId} checked={row.isPrimary} disabled={disabled || !row.skillId} onChange={() => setRows((current) => current.map((item, itemIndex) => ({ ...item, isPrimary: itemIndex === index })))} /> Principal
            </label>
            <button type="button" disabled={disabled} onClick={() => setRows((current) => current.filter((_, rowIndex) => rowIndex !== index))} className="h-10 text-sm font-medium text-red-700">Remover</button>
          </div>
        ))}
      </div>
      {rows.some((row) => row.isPrimary) ? <button type="button" disabled={disabled} onClick={() => setRows((current) => current.map((row) => ({ ...row, isPrimary: false })))} className="text-sm font-medium text-zinc-600">Remover definição de principal</button> : null}
      <div><button type="button" disabled={disabled || selectedIds.size >= options.filter((option) => option.active).length} onClick={() => setRows((current) => [...current, { skillId: "", proficiencyLevel: "3", isPrimary: false }])} className="inline-flex h-10 items-center rounded-lg border border-zinc-300 px-3 text-sm font-semibold text-zinc-800 disabled:opacity-50">Adicionar especialidade</button></div>
      {error ? <p role="alert" className="text-sm text-red-700">{error}</p> : null}
    </fieldset>
  );
}
