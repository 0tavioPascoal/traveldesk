"use client";

import { useActionState, useMemo, useState } from "react";

import { buttonStyles } from "@/components/ui/button";
import { InlineAlert } from "@/components/ui/inline-alert";
import { saveTripTeamAction } from "@/features/trips/actions/save-trip-team-action";
import { TechnicianAvailabilityBadge } from "@/features/trips/components/technician-availability-badge";
import type {
  TripStaffingActionState,
  TripTechnician,
  TripTechnicianCandidate,
  TripTechnicianFormValue,
} from "@/features/trips/types/trip-staffing";

const initialState = { status: "idle", message: null } satisfies TripStaffingActionState;

export function TripTeamEditor({ organizationSlug, tripId, technicians, candidates, editable, periodRequired }: {
  organizationSlug: string;
  tripId: string;
  technicians: TripTechnician[];
  candidates: TripTechnicianCandidate[];
  editable: boolean;
  periodRequired: boolean;
}) {
  const [rows, setRows] = useState<TripTechnicianFormValue[]>(() => technicians.map((item) => ({
    technicianId: item.technicianId,
    isResponsible: item.isResponsible,
    notes: item.notes ?? "",
  })));
  const [query, setQuery] = useState("");
  const [skillId, setSkillId] = useState("");
  const [state, action, pending] = useActionState(saveTripTeamAction.bind(null, organizationSlug, tripId), initialState);
  const selected = new Set(rows.map((item) => item.technicianId));
  const details = new Map<string, TripTechnicianCandidate | TripTechnician>([
    ...technicians.map((item) => [item.technicianId, item] as const),
    ...candidates.map((item) => [item.id, item] as const),
  ]);
  const skillOptions = useMemo(() => {
    const values = new Map<string, string>();
    candidates.forEach((candidate) => candidate.skills.forEach((skill) => values.set(skill.skillId, skill.skillName)));
    return [...values].sort((left, right) => left[1].localeCompare(right[1], "pt-BR"));
  }, [candidates]);
  const visibleCandidates = candidates.filter((candidate) => {
    const term = query.trim().toLocaleLowerCase("pt-BR");
    return (!term || candidate.name.toLocaleLowerCase("pt-BR").includes(term)
      || candidate.baseCity.toLocaleLowerCase("pt-BR").includes(term))
      && (!skillId || candidate.skills.some((skill) => skill.skillId === skillId));
  });
  const add = (candidate: TripTechnicianCandidate) => {
    if (!selected.has(candidate.id) && candidate.group !== "unavailable") {
      setRows((current) => [...current, { technicianId: candidate.id, isResponsible: false, notes: "" }]);
    }
  };
  const remove = (technicianId: string) => {
    if (window.confirm("Remover este técnico da viagem?")) {
      setRows((current) => current.filter((item) => item.technicianId !== technicianId));
    }
  };

  if (periodRequired) {
    return <InlineAlert tone="warning">Defina o período da viagem antes de alocar a equipe.</InlineAlert>;
  }

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="technicians" value={JSON.stringify(rows)} />
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Equipe selecionada</h3>
        {!rows.length ? <p className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">Nenhum técnico alocado.</p> : null}
        {rows.map((row) => {
          const technician = details.get(row.technicianId);
          if (!technician) return null;
          const active = "active" in technician ? technician.active : true;
          return (
            <div key={row.technicianId} className="grid gap-3 rounded-lg border border-border p-3 md:grid-cols-[1fr_auto_1fr_auto] md:items-center">
              <div>
                <p className="font-semibold">{technician.name}{active ? "" : " (inativo)"}</p>
                <p className="text-xs text-subtle-foreground">{technician.baseCity}/{technician.baseState}</p>
                <p className="mt-1 text-xs text-muted-foreground">{technician.skills.length ? technician.skills.map((skill) => `${skill.skillName} · ${skill.proficiencyLevel}`).join(", ") : "Sem especialidades"}</p>
              </div>
              <label className="flex items-center gap-2 text-sm font-medium"><input type="radio" name="responsible" checked={row.isResponsible} disabled={!editable || pending || !active} onChange={() => setRows((current) => current.map((item) => ({ ...item, isResponsible: item.technicianId === row.technicianId })))} /> Responsável</label>
              <input aria-label={`Observações sobre ${technician.name}`} maxLength={1000} value={row.notes} disabled={!editable || pending} onChange={(event) => setRows((current) => current.map((item) => item.technicianId === row.technicianId ? { ...item, notes: event.target.value } : item))} placeholder="Observações" className="h-10 rounded-lg border border-input bg-card px-3 text-sm" />
              {editable ? <button type="button" disabled={pending} onClick={() => remove(row.technicianId)} className="text-sm font-medium text-destructive">Remover</button> : null}
            </div>
          );
        })}
        {editable && rows.some((item) => item.isResponsible) ? <button type="button" disabled={pending} onClick={() => setRows((current) => current.map((item) => ({ ...item, isResponsible: false })))} className="text-sm font-medium text-muted-foreground">Deixar sem responsável</button> : null}
      </div>

      {editable ? (
        <div className="space-y-4 border-t border-border pt-5">
          <h3 className="text-sm font-semibold text-foreground">Adicionar técnico</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Pesquisar por nome ou cidade" className="h-10 rounded-lg border border-input bg-card px-3 text-sm" />
            <select value={skillId} onChange={(event) => setSkillId(event.target.value)} className="h-10 rounded-lg border border-input bg-card px-3 text-sm"><option value="">Todas as especialidades</option>{skillOptions.map(([id, name]) => <option key={id} value={id}>{name}</option>)}</select>
          </div>
          {!visibleCandidates.length ? <p className="text-sm text-muted-foreground">Nenhum técnico encontrado.</p> : null}
          <div className="grid gap-3 lg:grid-cols-2">
            {visibleCandidates.map((candidate) => (
              <article key={candidate.id} className="rounded-lg border border-border p-4">
                <div className="flex items-start justify-between gap-3"><div><h4 className="font-semibold">{candidate.name}</h4><p className="text-xs text-subtle-foreground">{candidate.baseCity}/{candidate.baseState}</p></div><TechnicianAvailabilityBadge reason={candidate.unavailableReason} /></div>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">{candidate.skills.length ? candidate.skills.map((skill) => `${skill.skillName} · ${skill.proficiencyLevel}`).join(", ") : "Sem especialidades cadastradas"}</p>
                {candidate.group === "recommended" ? <p className="mt-2 text-xs font-medium text-info">Cobre {candidate.coveredRequirementCount} requisito(s).</p> : null}
                <button type="button" disabled={pending || selected.has(candidate.id) || candidate.group === "unavailable" || rows.length >= 30} onClick={() => add(candidate)} className={`${buttonStyles({ variant: "secondary", size: "sm" })} mt-3`}>{selected.has(candidate.id) ? "Selecionado" : "Adicionar"}</button>
              </article>
            ))}
          </div>
        </div>
      ) : null}

      {editable ? <div className="flex justify-end"><button type="submit" disabled={pending} className={buttonStyles({ size: "sm" })}>{pending ? "Salvando..." : "Salvar equipe"}</button></div> : null}
      {state.message ? <InlineAlert tone={state.status === "error" ? "error" : "success"}>{state.message}</InlineAlert> : null}
    </form>
  );
}
