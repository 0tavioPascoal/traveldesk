import { BedDouble, CalendarClock, CarFront, CheckCircle2, Clock3, ShieldCheck, UserRoundCheck, UsersRound, Wrench } from "lucide-react";

import type { TripConfirmationReadiness } from "@/features/trips/types/trip-confirmation";
import type { TripExecutionSummary } from "@/features/trips/types/trip-execution";
import type { TripOvernightSummary } from "@/features/trips/types/trip-overnight";
import type { TripTeamSummary } from "@/features/trips/types/trip-staffing";
import type { TripTransportSummary } from "@/features/trips/types/trip-transport";
import type { TripDetails } from "@/features/trips/types/trip";

function compactPeriod(start: string | null, end: string | null, timezone: string) {
  if (!start || !end) return "Não definido";
  const format = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short", timeZone: timezone });
  return `${format.format(new Date(start))} → ${format.format(new Date(end))}`;
}

export function TripOperationalSummary({
  team,
  transport,
  overnights,
  trip,
  timezone,
  readiness,
  execution,
}: {
  team: TripTeamSummary;
  transport: TripTransportSummary;
  overnights: TripOvernightSummary;
  trip: TripDetails;
  timezone: string;
  readiness: TripConfirmationReadiness | null;
  execution: TripExecutionSummary;
}) {
  const responsible = team.technicians.find((technician) => technician.isResponsible);
  const items = [
    { label: "Período da viagem", value: compactPeriod(trip.travel_starts_at, trip.travel_ends_at, timezone), icon: CalendarClock },
    { label: "Atendimento", value: compactPeriod(trip.service_starts_at, trip.service_ends_at, timezone), icon: Clock3 },
    { label: "Equipe", value: `${team.technicians.length} ${team.technicians.length === 1 ? "técnico" : "técnicos"}`, icon: UsersRound },
    { label: "Responsável", value: responsible?.name ?? "Responsável pendente", icon: UserRoundCheck },
    { label: "Cobertura", value: team.coverage.totalCount === 0 ? "Sem requisitos" : team.coverage.complete ? "Completa" : `${team.coverage.coveredCount} de ${team.coverage.totalCount} requisitos`, icon: Wrench },
    { label: "Veículo", value: transport.assignment ? `${transport.assignment.brand} ${transport.assignment.model} · ${transport.assignment.plate}` : "Não reservado", icon: CarFront },
    { label: "Motorista", value: transport.assignment?.driverName ?? "Não definido", icon: ShieldCheck },
    { label: "Pernoites", value: overnights.effectiveOvernights === null ? "Não calculados" : !overnights.isReviewed ? `${overnights.effectiveOvernights} · revisão pendente` : `${overnights.effectiveOvernights} revisados`, icon: BedDouble },
    { label: "Situação", value: readiness ? readiness.ready ? "Pronta para confirmar" : "Com pendências" : execution.transitionLabel ?? (trip.status === "finished" ? "Concluída" : trip.status === "canceled" ? "Cancelada" : "Em planejamento"), icon: CheckCircle2 },
  ];

  return (
    <section aria-labelledby="resumo-operacional" className="rounded-xl border border-border bg-surface shadow-sm">
      <h2 id="resumo-operacional" className="sr-only">Resumo operacional</h2>
      <dl className="grid sm:grid-cols-2 xl:grid-cols-3">
        {items.map(({ label, value, icon: Icon }, index) => (
          <div key={label} className={`flex min-w-0 gap-3 p-4 ${index > 0 ? "border-t border-border sm:border-t-0" : ""} ${index % 2 === 1 ? "sm:border-l" : ""} ${index >= 2 ? "sm:border-t" : ""} ${index >= 3 ? "xl:border-t-0" : ""} ${index % 3 !== 0 ? "xl:border-l" : "xl:border-l-0"} ${index >= 3 ? "xl:border-t" : ""}`}>
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary"><Icon aria-hidden="true" className="size-4" /></span>
            <div className="min-w-0"><dt className="text-xs font-medium uppercase tracking-wide text-subtle-foreground">{label}</dt><dd className="mt-1 text-sm font-semibold leading-5 text-foreground">{value}</dd></div>
          </div>
        ))}
      </dl>
    </section>
  );
}
