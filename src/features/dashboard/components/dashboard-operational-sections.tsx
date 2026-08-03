import { AlertTriangle, CalendarClock, Info, TriangleAlert } from "lucide-react";
import Link from "next/link";

import { SectionHeader } from "@/components/page/section-header";
import { Badge } from "@/components/ui/badge";
import type {
  DashboardAlert,
  OperationalDashboardData,
} from "@/features/dashboard/types/operational-dashboard";
import { TripStatusBadge } from "@/features/trips/components/trip-badges";

function formatStart(value: string, timezone: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: timezone,
  }).format(new Date(value));
}

const alertStyles: Record<DashboardAlert["level"], {
  icon: typeof AlertTriangle;
  tone: "danger" | "warning" | "info";
  className: string;
  label: string;
}> = {
  critical: {
    icon: AlertTriangle,
    tone: "danger",
    className: "bg-destructive/10 text-destructive",
    label: "Crítico",
  },
  warning: {
    icon: TriangleAlert,
    tone: "warning",
    className: "bg-warning/10 text-warning",
    label: "Atenção",
  },
  info: {
    icon: Info,
    tone: "info",
    className: "bg-info/10 text-info",
    label: "Informativo",
  },
};

export function DashboardOperationalSections({
  data,
}: {
  organizationSlug: string;
  data: OperationalDashboardData;
}) {
  return (
    <div className="grid gap-4 xl:grid-cols-12">
      <section className="rounded-xl border border-border bg-card p-4 sm:p-5 xl:col-span-5">
        <SectionHeader
          title="Próximas viagens"
          description="Planejadas ou confirmadas com início futuro no período."
        />
        {data.upcomingTrips.length ? (
          <ul className="mt-4 divide-y divide-border">
            {data.upcomingTrips.map((trip) => (
              <li key={trip.id} className="py-3 first:pt-0 last:pb-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link href={trip.href} className="font-mono text-xs font-semibold text-primary hover:underline">{trip.code}</Link>
                    <h3 className="mt-1 line-clamp-1 font-semibold"><Link href={trip.href} className="hover:text-primary hover:underline">{trip.title}</Link></h3>
                    <p className="mt-1 truncate text-xs text-muted-foreground">{trip.clientName} · {trip.unitName}</p>
                  </div>
                  <TripStatusBadge status={trip.status} />
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1"><CalendarClock aria-hidden="true" className="size-3.5" />{formatStart(trip.startsAt, data.timezone)}</span>
                  <span>{trip.technicianNames.length
                    ? `${trip.technicianNames.slice(0, 2).join(", ")}${trip.technicianNames.length > 2 ? ` +${trip.technicianNames.length - 2}` : ""}`
                    : "Equipe não definida"}</span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 rounded-lg border border-dashed border-border p-7 text-center text-sm text-muted-foreground">Nenhuma próxima viagem programada.</p>
        )}
      </section>

      <section className="rounded-xl border border-border bg-card p-4 sm:p-5 xl:col-span-3">
        <SectionHeader
          title="Técnicos mais alocados"
          description="Horas de ocupação registradas no período."
        />
        {data.topTechnicians.length ? (
          <ol className="mt-4 space-y-4">
            {data.topTechnicians.map((technician) => (
              <li key={technician.id}>
                <div className="flex items-start justify-between gap-2 text-sm">
                  <Link href={technician.href} className="min-w-0 truncate font-semibold hover:text-primary hover:underline">
                    {technician.name}{technician.active ? "" : " (inativo)"}
                  </Link>
                  <span className="shrink-0 text-xs text-muted-foreground">{technician.allocatedHours.toLocaleString("pt-BR")}h</span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                  <span className="block h-full rounded-full bg-primary" style={{ width: `${technician.relativeLoad}%` }} />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{technician.tripCount} {technician.tripCount === 1 ? "viagem" : "viagens"}</p>
              </li>
            ))}
          </ol>
        ) : (
          <p className="mt-4 rounded-lg border border-dashed border-border p-7 text-center text-sm text-muted-foreground">Nenhum técnico alocado no período.</p>
        )}
      </section>

      <section className="rounded-xl border border-border bg-card p-4 sm:p-5 xl:col-span-4">
        <SectionHeader
          title="Alertas e pendências"
          description="Pontos que exigem revisão operacional."
        />
        {data.alerts.length ? (
          <ul className="mt-4 space-y-3">
            {data.alerts.map((alert) => {
              const style = alertStyles[alert.level];
              const Icon = style.icon;
              return (
                <li key={alert.id}>
                  <Link href={alert.href} className="flex gap-3 rounded-lg border border-border p-3 outline-none transition hover:bg-muted/35 focus-visible:ring-2 focus-visible:ring-ring">
                    <span className={`grid size-8 shrink-0 place-items-center rounded-lg ${style.className}`}><Icon aria-hidden="true" className="size-4" /></span>
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold">{alert.title}</span>
                        <Badge tone={style.tone}>{style.label}</Badge>
                        <Badge tone="neutral">{alert.count}</Badge>
                      </span>
                      <span className="mt-1 block text-xs leading-5 text-muted-foreground">{alert.description}</span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="mt-4 rounded-lg border border-dashed border-border p-7 text-center text-sm text-muted-foreground">Nenhuma pendência operacional identificada.</p>
        )}
      </section>
    </div>
  );
}
