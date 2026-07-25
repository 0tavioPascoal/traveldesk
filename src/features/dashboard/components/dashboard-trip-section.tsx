import { CalendarClock, MapPin } from "lucide-react";
import Link from "next/link";

import { SectionHeader } from "@/components/page/section-header";
import { buttonStyles } from "@/components/ui/button";
import { TripPriorityBadge, TripStatusBadge } from "@/features/trips/components/trip-badges";
import type { TripListItem } from "@/features/trips/types/trip";

function formatPeriod(item: TripListItem, timezone: string) {
  if (!item.travel_starts_at || !item.travel_ends_at) return "Período não informado";
  const format = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", timeZone: timezone });
  return `${format.format(new Date(item.travel_starts_at))} → ${format.format(new Date(item.travel_ends_at))}`;
}

export function DashboardTripSection({ organizationSlug, title, description, emptyMessage, trips, timezone }: { organizationSlug: string; title: string; description: string; emptyMessage: string; trips: TripListItem[]; timezone: string }) {
  const base = `/app/${organizationSlug}/planejamento/viagens`;
  return (
    <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
      <SectionHeader title={title} description={description} actions={<Link href={base} className={buttonStyles({ variant: "ghost", size: "sm" })}>Ver todas</Link>} />
      {trips.length ? <ul className="mt-5 divide-y divide-border">{trips.map((trip) => <li key={trip.id} className="py-4 first:pt-0 last:pb-0"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><Link href={`${base}/${trip.id}`} className="font-mono text-xs text-muted-foreground hover:text-foreground hover:underline">{trip.code}</Link><h3 className="mt-1 line-clamp-2 font-semibold leading-5 text-card-foreground"><Link href={`${base}/${trip.id}`} className="hover:text-primary hover:underline">{trip.title}</Link></h3><p className="mt-1 truncate text-sm text-muted-foreground">{trip.client_name_snapshot} · {trip.client_unit_name_snapshot}</p></div><TripStatusBadge status={trip.status} /></div><div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground"><span className="flex items-center gap-1.5"><CalendarClock aria-hidden="true" className="size-3.5" />{formatPeriod(trip, timezone)}</span><span className="flex items-center gap-1.5"><MapPin aria-hidden="true" className="size-3.5" />{trip.destination_city && trip.destination_state ? `${trip.destination_city}/${trip.destination_state}` : "Destino não informado"}</span><TripPriorityBadge priority={trip.priority} /></div></li>)}</ul> : <div className="mt-5 rounded-xl border border-dashed border-border bg-muted/25 px-4 py-8 text-center"><p className="text-sm font-medium text-card-foreground">{emptyMessage}</p></div>}
    </section>
  );
}
