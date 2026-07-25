import { UserRoundCheck } from "lucide-react";

import { SectionHeader } from "@/components/page/section-header";
import { TripRequiredSkillsEditor } from "@/features/trips/components/trip-required-skills-editor";
import { TripSkillCoverage } from "@/features/trips/components/trip-skill-coverage";
import { TripTeamEditor } from "@/features/trips/components/trip-team-editor";
import type { TripStatus } from "@/features/trips/types/trip";
import type { TripTeamSummary, TripTechnicianCandidates } from "@/features/trips/types/trip-staffing";

export function TripTeamSection({ organizationSlug, tripId, status, summary, candidates, skillOptions }: {
  organizationSlug: string;
  tripId: string;
  status: TripStatus;
  summary: TripTeamSummary;
  candidates: TripTechnicianCandidates;
  skillOptions: Array<{ id: string; name: string; active: boolean }>;
}) {
  const editable = status === "draft" || status === "planned";
  const responsible = summary.technicians.find((technician) => technician.isResponsible);
  return (
    <section className="space-y-6">
      <SectionHeader title="Equipe técnica" description="Participantes, responsável, requisitos e cobertura das especialidades." />
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <SectionHeader title="Responsável pela viagem" description="O responsável deve permanecer na equipe durante o planejamento." />
        <div className="mt-4 flex items-start gap-3 rounded-xl bg-muted p-4">
          <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-accent text-accent-foreground"><UserRoundCheck aria-hidden="true" className="size-5" /></span>
          <div><p className="font-semibold text-foreground">{responsible?.name ?? "Responsável pendente"}</p><p className="mt-1 text-sm text-muted-foreground">{responsible ? responsible.skills.length ? responsible.skills.map((skill) => skill.skillName).join(", ") : "Sem especialidades cadastradas" : "Defina um técnico alocado como responsável antes da confirmação."}</p></div>
        </div>
      </div>
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <SectionHeader title="Requisitos técnicos" description="Especialidades e níveis mínimos necessários para a viagem." />
        <div className="mt-5"><TripRequiredSkillsEditor organizationSlug={organizationSlug} tripId={tripId} requirements={summary.requirements} options={skillOptions} editable={editable} /></div>
      </div>
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <SectionHeader title="Cobertura de especialidades" description="Compare os requisitos com a experiência da equipe atual." />
        <div className="mt-5"><TripSkillCoverage coverage={summary.coverage} /></div>
      </div>
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <SectionHeader title="Participantes" description="Selecione os técnicos da equipe e ajuste o responsável." />
        {!editable ? <p className="mt-4 rounded-lg bg-surface-muted p-3 text-sm text-muted-foreground">A equipe permanece somente para consulta após a confirmação ou encerramento da viagem.</p> : null}
        <div className="mt-5"><TripTeamEditor organizationSlug={organizationSlug} tripId={tripId} technicians={summary.technicians} candidates={candidates.items} editable={editable} periodRequired={candidates.periodRequired} /></div>
      </div>
    </section>
  );
}
