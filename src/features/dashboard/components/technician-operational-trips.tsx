import { CalendarDays, MapPin, Route } from "lucide-react";
import Link from "next/link";

import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { TripPriorityBadge, TripStatusBadge } from "@/features/trips/components/trip-badges";
import type { TechnicianOperationalTrip } from "@/features/trips/types/technician-operational-trip";

function dateTime(value: string | null, timezone: string) {
  if (!value) return "Período não informado";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: timezone,
  }).format(new Date(value));
}

export function TechnicianOperationalTrips({
  organizationSlug,
  timezone,
  trips,
}: {
  organizationSlug: string;
  timezone: string;
  trips: TechnicianOperationalTrip[];
}) {
  if (trips.length === 0) {
    return (
      <EmptyState
        title="Nenhuma viagem operacional"
        description="Quando uma viagem confirmada for alocada a você, ela aparecerá aqui para acompanhamento."
        icon={Route}
      />
    );
  }

  return (
    <section aria-labelledby="technician-trips-title" className="space-y-4">
      <div>
        <h2 id="technician-trips-title" className="text-lg font-semibold text-foreground">Minhas viagens operacionais</h2>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">Acompanhe somente as viagens confirmadas em que você integra a equipe.</p>
      </div>
      <ul className="grid gap-4 lg:grid-cols-2">
        {trips.map((trip) => (
          <li key={trip.id}>
            <Link
              href={`/app/${organizationSlug}/planejamento/viagens/${trip.id}`}
              className="block h-full rounded-2xl border border-border bg-card p-5 text-card-foreground shadow-sm transition hover:border-input hover:bg-muted/30 focus-visible:ring-2 focus-visible:ring-ring"
            >
              <div className="flex flex-wrap items-center gap-2">
                <TripStatusBadge status={trip.status} />
                <TripPriorityBadge priority={trip.priority} />
                {trip.isResponsible ? <Badge tone="primary">Técnico responsável</Badge> : <Badge tone="neutral">Equipe</Badge>}
              </div>
              <p className="mt-4 font-mono text-xs font-semibold text-subtle-foreground">{trip.code}</p>
              <h3 className="mt-1 text-lg font-semibold">{trip.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{trip.clientName} · {trip.clientUnitName}</p>
              <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                <p className="flex items-start gap-2"><CalendarDays aria-hidden="true" className="mt-0.5 size-4 shrink-0" /><span>{dateTime(trip.travelStartsAt, timezone)} — {dateTime(trip.travelEndsAt, timezone)}</span></p>
                <p className="flex items-center gap-2"><MapPin aria-hidden="true" className="size-4 shrink-0" /><span>{trip.destinationCity ? `${trip.destinationCity}/${trip.destinationState}` : "Destino não informado"}</span></p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
