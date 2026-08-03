"use client";

import { useState } from "react";

import {
  formControlClassName,
  formSectionClassName,
  RequiredIndicator,
} from "@/components/forms/form-layout";
import { SectionHeader } from "@/components/page/section-header";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import type { TechnicianFormSkillValue } from "@/features/technicians/types/technician";

type SkillOption = { id: string; name: string; active: boolean };
type Props = { options: SkillOption[]; initialValues: TechnicianFormSkillValue[]; disabled: boolean; error?: string };

export function TechnicianSkillFields({ options, initialValues, disabled, error }: Props) {
  const [rows, setRows] = useState(() => initialValues);
  const [removingIndex, setRemovingIndex] = useState<number | null>(null);
  const selectedIds = new Set(rows.map((row) => row.skillId).filter(Boolean));
  const availableCount = options.filter((option) => option.active && !selectedIds.has(option.id)).length;
  const update = (index: number, values: Partial<TechnicianFormSkillValue>) => setRows((current) => current.map((row, rowIndex) => rowIndex === index ? { ...row, ...values } : row));

  return <section aria-labelledby="skill-fields-title" aria-describedby={error ? "skill-fields-error" : undefined} className={formSectionClassName}>
    <SectionHeader id="skill-fields-title" title="Especialidades" description="Competências técnicas utilizadas na alocação, com proficiência de 1 a 5 e uma principal opcional." actions={<button type="button" disabled={disabled || availableCount === 0 || rows.some((row) => !row.skillId)} onClick={() => setRows((current) => [...current, { skillId: "", proficiencyLevel: "3", isPrimary: false }])} className={buttonStyles({ variant: "secondary", size: "sm" })}>Adicionar especialidade</button>} />
    {rows.length === 0 ? <p className="mt-5 rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">{options.some((option) => option.active) ? "Nenhuma especialidade associada." : "Não há especialidades ativas disponíveis."}</p> : <div className="mt-5 space-y-3">{rows.map((row, index) => {
      const option = options.find((item) => item.id === row.skillId);
      return <div key={`${row.skillId}-${index}`} className="rounded-xl border border-border p-4"><div className="grid gap-4 md:grid-cols-[minmax(12rem,1fr)_12rem_auto] md:items-end"><div className="space-y-1.5"><label htmlFor={`skill-${index}`} className="text-sm font-medium text-foreground">Especialidade <RequiredIndicator /></label><select id={`skill-${index}`} name="skillId" value={row.skillId} required disabled={disabled} onChange={(event) => update(index, { skillId: event.target.value, isPrimary: false })} className={formControlClassName}><option value="">Selecione</option>{options.map((item) => <option key={item.id} value={item.id} disabled={!item.active || (selectedIds.has(item.id) && item.id !== row.skillId)}>{item.name}{item.active ? "" : " (inativa)"}</option>)}</select></div><div className="space-y-1.5"><label htmlFor={`level-${index}`} className="text-sm font-medium text-foreground">Proficiência</label><select id={`level-${index}`} name="proficiencyLevel" value={row.proficiencyLevel} disabled={disabled} onChange={(event) => update(index, { proficiencyLevel: event.target.value })} className={formControlClassName}><option value="1">Nível 1 de 5</option><option value="2">Nível 2 de 5</option><option value="3">Nível 3 de 5</option><option value="4">Nível 4 de 5</option><option value="5">Nível 5 de 5</option></select></div><label className="flex h-11 items-center gap-2 text-sm font-medium"><input type="radio" name="primarySkillId" value={row.skillId} checked={row.isPrimary} disabled={disabled || !row.skillId} onChange={() => setRows((current) => current.map((item, itemIndex) => ({ ...item, isPrimary: itemIndex === index })))} />Especialidade principal</label></div><div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3"><div className="flex gap-2">{row.isPrimary ? <Badge tone="primary">Principal</Badge> : <Badge>Secundária</Badge>}{option && !option.active ? <Badge tone="warning">Especialidade inativa</Badge> : null}</div>{removingIndex === index ? <div className="flex flex-wrap items-center gap-2"><span className="text-sm text-muted-foreground">Remover este vínculo?</span><button type="button" disabled={disabled} onClick={() => setRemovingIndex(null)} className={buttonStyles({ variant: "ghost", size: "sm" })}>Cancelar</button><button type="button" disabled={disabled} onClick={() => { setRows((current) => current.filter((_, rowIndex) => rowIndex !== index)); setRemovingIndex(null); }} className={buttonStyles({ variant: "destructive", size: "sm" })}>Remover vínculo</button></div> : <button type="button" disabled={disabled} onClick={() => setRemovingIndex(index)} className={buttonStyles({ variant: "ghost", size: "sm" })}>Remover</button>}</div></div>;
    })}</div>}
    {rows.some((row) => row.isPrimary) ? <button type="button" disabled={disabled} onClick={() => setRows((current) => current.map((row) => ({ ...row, isPrimary: false })))} className={`${buttonStyles({ variant: "ghost", size: "sm" })} mt-3`}>Remover definição de principal</button> : null}
    {availableCount === 0 && options.length > 0 ? <p className="mt-4 text-sm text-muted-foreground">Todas as especialidades disponíveis já estão vinculadas ao técnico.</p> : null}
    {error ? <p id="skill-fields-error" role="alert" className="mt-4 text-sm text-destructive">{error}</p> : null}
  </section>;
}
