"use client";

import { useActionState, useState } from "react";

import { buttonStyles } from "@/components/ui/button";
import { InlineAlert } from "@/components/ui/inline-alert";
import { saveTripRequiredSkillsAction } from "@/features/trips/actions/save-trip-required-skills-action";
import type { TripRequiredSkill, TripRequiredSkillFormValue, TripStaffingActionState } from "@/features/trips/types/trip-staffing";

type SkillOption = { id: string; name: string; active: boolean };
const initialState = { status: "idle", message: null } satisfies TripStaffingActionState;

export function TripRequiredSkillsEditor({ organizationSlug, tripId, requirements, options, editable }: {
  organizationSlug: string;
  tripId: string;
  requirements: TripRequiredSkill[];
  options: SkillOption[];
  editable: boolean;
}) {
  const [rows, setRows] = useState<TripRequiredSkillFormValue[]>(() => requirements.map((item) => ({
    skillId: item.skillId,
    minimumProficiencyLevel: item.minimumProficiencyLevel,
    notes: item.notes ?? "",
  })));
  const [state, action, pending] = useActionState(
    saveTripRequiredSkillsAction.bind(null, organizationSlug, tripId),
    initialState,
  );
  const selected = new Set(rows.map((item) => item.skillId));
  const update = (index: number, values: Partial<TripRequiredSkillFormValue>) => {
    setRows((current) => current.map((row, rowIndex) => rowIndex === index ? { ...row, ...values } : row));
  };
  const remove = (index: number) => {
    if (window.confirm("Remover este requisito técnico?")) {
      setRows((current) => current.filter((_, rowIndex) => rowIndex !== index));
    }
  };

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="requirements" value={JSON.stringify(rows)} />
      {!rows.length ? <p className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">Nenhuma especialidade exigida.</p> : null}
      {rows.map((row, index) => (
        <div key={`${row.skillId}-${index}`} className="grid gap-3 rounded-lg bg-muted p-3 md:grid-cols-[1fr_11rem_1fr_auto] md:items-end">
          <div className="space-y-1">
            <label htmlFor={`required-skill-${index}`} className="text-sm font-medium">Especialidade</label>
            <select id={`required-skill-${index}`} value={row.skillId} disabled={!editable || pending} onChange={(event) => update(index, { skillId: event.target.value })} className="h-10 w-full rounded-lg border border-input bg-card px-3 text-sm text-card-foreground">
              <option value="">Selecione</option>
              {options.map((option) => <option key={option.id} value={option.id} disabled={!option.active || (selected.has(option.id) && option.id !== row.skillId)}>{option.name}{option.active ? "" : " (inativa)"}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label htmlFor={`required-level-${index}`} className="text-sm font-medium">Nível mínimo</label>
            <select id={`required-level-${index}`} value={row.minimumProficiencyLevel} disabled={!editable || pending} onChange={(event) => update(index, { minimumProficiencyLevel: Number(event.target.value) })} className="h-10 w-full rounded-lg border border-input bg-card px-3 text-sm text-card-foreground">
              {[1, 2, 3, 4, 5].map((level) => <option key={level} value={level}>Nível {level}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label htmlFor={`required-notes-${index}`} className="text-sm font-medium">Observações</label>
            <input id={`required-notes-${index}`} maxLength={1000} value={row.notes} disabled={!editable || pending} onChange={(event) => update(index, { notes: event.target.value })} className="h-10 w-full rounded-lg border border-input bg-card px-3 text-sm text-card-foreground" />
          </div>
          {editable ? <button type="button" disabled={pending} onClick={() => remove(index)} className="h-10 text-sm font-medium text-destructive">Remover</button> : null}
        </div>
      ))}
      {editable ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button type="button" disabled={pending || rows.length >= 25 || options.every((option) => !option.active || selected.has(option.id))} onClick={() => setRows((current) => [...current, { skillId: "", minimumProficiencyLevel: 3, notes: "" }])} className={buttonStyles({ variant: "secondary", size: "sm" })}>Adicionar requisito</button>
          <button type="submit" disabled={pending || rows.some((row) => !row.skillId)} className={buttonStyles({ size: "sm" })}>{pending ? "Salvando..." : "Salvar requisitos"}</button>
        </div>
      ) : null}
      {state.message ? <InlineAlert tone={state.status === "error" ? "error" : "success"}>{state.message}</InlineAlert> : null}
    </form>
  );
}
