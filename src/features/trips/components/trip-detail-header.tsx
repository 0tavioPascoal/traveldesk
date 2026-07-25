import { CalendarDays, MapPin } from "lucide-react";
import type { ReactNode } from "react";

import { TripPriorityBadge, TripStatusBadge } from "@/features/trips/components/trip-badges";
import type { TripDetails } from "@/features/trips/types/trip";

function dateTime(value: string | null, timezone: string) {
  return value
    ? new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium", timeStyle: "short", timeZone: timezone }).format(new Date(value))
    : "Período não informado";
}

export function TripDetailHeader({
  trip,
  timezone,
  primaryAction,
  additionalActions,
}: {
  trip: TripDetails;
  timezone: string;
  primaryAction: ReactNode;
  additionalActions: ReactNode;
}) {
  return (
    <header className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.12em] text-subtle-foreground">{trip.code}</p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{trip.title}</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {trip.client_name_snapshot} <span aria-hidden="true">·</span> {trip.client_unit_name_snapshot}
            {trip.destination_city ? <><span aria-hidden="true"> · </span>{trip.destination_city}/{trip.destination_state}</> : null}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <TripStatusBadge status={trip.status} />
            <TripPriorityBadge priority={trip.priority} />
          </div>
          <div className="mt-4 flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:flex-wrap sm:gap-x-5">
            <span className="inline-flex items-start gap-2"><CalendarDays aria-hidden="true" className="mt-0.5 size-4 shrink-0" />{dateTime(trip.travel_starts_at, timezone)} — {dateTime(trip.travel_ends_at, timezone)}</span>
            <span className="inline-flex items-center gap-2"><MapPin aria-hidden="true" className="size-4" />{trip.origin_city ? `${trip.origin_city}/${trip.origin_state}` : "Origem não informada"} → {trip.destination_city ? `${trip.destination_city}/${trip.destination_state}` : "Destino não informado"}</span>
          </div>
        </div>
        <div className="flex w-full shrink-0 flex-col gap-2 sm:flex-row lg:w-auto lg:justify-end">
          {primaryAction}
          {additionalActions}
        </div>
      </div>
    </header>
  );
}
