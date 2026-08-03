import { CalendarDays, MapPin } from "lucide-react";

import { Breadcrumb } from "@/components/page/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { InlineAlert } from "@/components/ui/inline-alert";
import { TripExecutionSection } from "@/features/trips/components/trip-execution-section";
import { TripHistorySection } from "@/features/trips/components/trip-history-section";
import { TripPrimaryAction } from "@/features/trips/components/trip-primary-action";
import { TripPriorityBadge, TripStatusBadge } from "@/features/trips/components/trip-badges";
import type { TripExecutionSummary } from "@/features/trips/types/trip-execution";
import type { TechnicianOperationalTrip } from "@/features/trips/types/technician-operational-trip";

function dateTime(value: string | null, timezone: string) {
  if (!value) return "Não informado";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: timezone,
  }).format(new Date(value));
}

export function TechnicianOperationalTripDetails({
  organizationSlug,
  timezone,
  trip,
  execution,
}: {
  organizationSlug: string;
  timezone: string;
  trip: TechnicianOperationalTrip;
  execution: TripExecutionSummary;
}) {
  const visibleExecution = trip.isResponsible
    ? execution
    : { ...execution, nextStatus: null, canTransition: false, transitionLabel: null };

  return (
    <>
      <Breadcrumb items={[
        { label: "Visão geral", href: `/app/${organizationSlug}/dashboard` },
        { label: trip.code },
      ]} />
      <header className="rounded-2xl border border-border bg-card p-5 text-card-foreground shadow-sm sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.12em] text-subtle-foreground">{trip.code}</p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">{trip.title}</h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{trip.clientName} · {trip.clientUnitName}</p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <TripStatusBadge status={trip.status} />
              <TripPriorityBadge priority={trip.priority} />
              <Badge tone={trip.isResponsible ? "primary" : "neutral"}>
                {trip.isResponsible ? "Técnico responsável" : "Integrante da equipe"}
              </Badge>
            </div>
            <div className="mt-4 space-y-2 text-sm text-muted-foreground">
              <p className="flex items-start gap-2"><CalendarDays aria-hidden="true" className="mt-0.5 size-4 shrink-0" /><span>Viagem: {dateTime(trip.travelStartsAt, timezone)} — {dateTime(trip.travelEndsAt, timezone)}</span></p>
              <p className="flex items-start gap-2"><CalendarDays aria-hidden="true" className="mt-0.5 size-4 shrink-0" /><span>Atendimento: {dateTime(trip.serviceStartsAt, timezone)} — {dateTime(trip.serviceEndsAt, timezone)}</span></p>
              <p className="flex items-center gap-2"><MapPin aria-hidden="true" className="size-4 shrink-0" /><span>{trip.destinationCity ? `${trip.destinationCity}/${trip.destinationState}` : "Destino não informado"}</span></p>
            </div>
          </div>
          {trip.isResponsible ? (
            <TripPrimaryAction
              organizationSlug={organizationSlug}
              tripId={trip.id}
              status={trip.status}
              readiness={null}
              execution={visibleExecution}
            />
          ) : null}
        </div>
      </header>
      {!trip.isResponsible ? (
        <InlineAlert>Somente o técnico responsável pode registrar a próxima etapa. Você pode acompanhar o status e o histórico desta viagem.</InlineAlert>
      ) : null}
      <TripExecutionSection summary={visibleExecution} timezone={timezone} />
      <TripHistorySection summary={visibleExecution} timezone={timezone} />
    </>
  );
}
