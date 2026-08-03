import {
  AlertTriangle,
  CalendarDays,
  CarFront,
  CheckCircle2,
  UsersRound,
} from "lucide-react";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";

import { SectionHeader } from "@/components/page/section-header";
import type {
  DashboardStatusPoint,
  OperationalDashboardData,
} from "@/features/dashboard/types/operational-dashboard";

const statusToneStyles: Record<DashboardStatusPoint["tone"], string> = {
  neutral: "bg-muted-foreground",
  info: "bg-info",
  primary: "bg-primary",
  success: "bg-success",
  danger: "bg-destructive",
};

const priorityToneStyles = {
  muted: "bg-muted-foreground",
  info: "bg-info",
  warning: "bg-warning",
  danger: "bg-destructive",
} as const;

function ChartCard({
  title,
  description,
  className = "",
  children,
}: {
  title: string;
  description: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section className={`min-w-0 rounded-xl border border-border bg-card p-4 sm:p-5 ${className}`}>
      <SectionHeader title={title} description={description} />
      {children}
    </section>
  );
}

function ChartTooltip({
  label,
  children,
  className = "",
  style,
}: {
  label: string;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <span
      role="img"
      tabIndex={0}
      aria-label={label}
      className={`group relative outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card ${className}`}
      style={style}
    >
      {children}
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 hidden w-max max-w-56 -translate-x-1/2 rounded-md border border-border bg-popover px-2.5 py-1.5 text-xs font-medium text-popover-foreground shadow-lg group-hover:block group-focus:block"
      >
        {label}
      </span>
    </span>
  );
}

export function DashboardMetrics({
  organizationSlug,
  data,
}: {
  organizationSlug: string;
  data: OperationalDashboardData;
}) {
  const tripParams = new URLSearchParams({
    startsOn: data.period.startDate,
    endsOn: data.period.endDate,
  });
  if (data.filters.status !== "all") tripParams.set("status", data.filters.status);
  if (data.filters.priority !== "all") tripParams.set("priority", data.filters.priority);
  const finishedParams = new URLSearchParams(tripParams);
  finishedParams.set("status", "finished");
  const items = [
    {
      label: "Viagens no período",
      value: data.metrics.trips,
      detail: "Inclui todos os status apresentados",
      href: `/app/${organizationSlug}/planejamento/viagens?${tripParams}`,
      icon: CalendarDays,
      tone: "bg-accent text-accent-foreground",
    },
    {
      label: "Técnicos alocados",
      value: data.metrics.allocatedTechnicians,
      detail: "Profissionais distintos em viagens não canceladas",
      href: `/app/${organizationSlug}/cadastros/tecnicos`,
      icon: UsersRound,
      tone: "bg-info/10 text-info",
    },
    {
      label: "Conflitos",
      value: data.metrics.conflicts,
      detail: "Viagens com conflito operacional identificado",
      href: `/app/${organizationSlug}/planejamento/viagens?${tripParams}`,
      icon: AlertTriangle,
      tone: data.metrics.conflicts
        ? "bg-destructive/10 text-destructive"
        : "bg-muted text-muted-foreground",
    },
    {
      label: "Veículos em uso",
      value: data.metrics.occupiedVehicles,
      detail: "Veículos distintos em viagens não canceladas",
      href: `/app/${organizationSlug}/cadastros/veiculos`,
      icon: CarFront,
      tone: "bg-warning/10 text-warning",
    },
    {
      label: "Viagens concluídas",
      value: data.metrics.finishedTrips,
      detail: "Status finalizada no período selecionado",
      href: `/app/${organizationSlug}/planejamento/viagens?${finishedParams}`,
      icon: CheckCircle2,
      tone: "bg-success/10 text-success",
    },
  ];
  return (
    <section aria-labelledby="dashboard-metrics-title">
      <h2 id="dashboard-metrics-title" className="sr-only">Indicadores principais</h2>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-5">
        {items.map(({ label, value, detail, href, icon: Icon, tone }) => (
          <Link
            key={label}
            href={href}
            className="group min-w-0 rounded-xl border border-border bg-card p-4 outline-none transition hover:border-input hover:bg-muted/30 focus-visible:ring-2 focus-visible:ring-ring"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-medium text-muted-foreground">{label}</p>
                <p className="mt-2 text-2xl font-bold tracking-tight text-card-foreground sm:text-3xl">{value}</p>
              </div>
              <span className={`grid size-9 shrink-0 place-items-center rounded-lg ${tone}`}>
                <Icon aria-hidden="true" className="size-4" />
              </span>
            </div>
            <p className="mt-3 line-clamp-2 text-xs leading-5 text-muted-foreground">{detail}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function DashboardCharts({
  data,
  organizationSlug,
}: {
  data: OperationalDashboardData;
  organizationSlug: string;
}) {
  const maximum = Math.max(1, ...data.tripsByDay.map((item) => item.count));
  const total = data.tripsByStatus.reduce((sum, item) => sum + item.count, 0);
  const compactLabels = data.tripsByDay.length > 10;
  return (
    <section aria-labelledby="dashboard-analytics-title" className="space-y-4">
      <div>
        <h2 id="dashboard-analytics-title" className="text-lg font-semibold text-foreground">
          Análise operacional
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Distribuições consolidadas do período e dos filtros selecionados.
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-12">
        <ChartCard
          title="Viagens por dia"
          description="Cada viagem é contada em todos os dias em que seu período está ativo."
          className="xl:col-span-8"
        >
        {total ? (
          <>
            <div
              className="mt-6 grid h-56 items-end gap-1 border-b border-border sm:gap-2"
              style={{ gridTemplateColumns: `repeat(${data.tripsByDay.length}, minmax(0, 1fr))` }}
            >
              {data.tripsByDay.map((item, index) => (
                <div key={item.date} className="flex h-full min-w-0 flex-col justify-end gap-2">
                  <span className="text-center text-[10px] font-semibold text-muted-foreground">{item.count}</span>
                  <ChartTooltip
                    label={`${item.weekday}, ${item.dateLabel}: ${item.count} ${item.count === 1 ? "viagem" : "viagens"}`}
                    className="block min-h-1 rounded-t"
                    style={{ height: `${Math.max(item.count ? 8 : 2, (item.count / maximum) * 100)}%` }}
                  >
                    <span
                      aria-hidden="true"
                      className="block size-full rounded-t bg-primary/80 transition group-hover:bg-primary"
                    />
                  </ChartTooltip>
                  <span className="truncate text-center text-[9px] text-muted-foreground sm:text-[10px]">
                    {!compactLabels || index % 5 === 0 ? item.weekday : "·"}
                  </span>
                </div>
              ))}
            </div>
            <ul className="sr-only">
              {data.tripsByDay.map((item) => (
                <li key={item.date}>{item.weekday}, {item.dateLabel}: {item.count} viagens</li>
              ))}
            </ul>
          </>
        ) : (
          <p className="mt-5 rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">Nenhuma viagem encontrada no período.</p>
        )}
        </ChartCard>

        <ChartCard
          title="Status das viagens"
          description="Distribuição agrupada sem alterar os status do domínio."
          className="xl:col-span-4"
        >
        {total ? (
          <>
            <div className="mt-6 flex h-3 rounded-full bg-muted">
              {data.tripsByStatus.filter((item) => item.count > 0).map((item) => (
                <ChartTooltip
                  key={item.key}
                  label={`${item.label}: ${item.count} (${item.percentage}%)`}
                  className={`block first:rounded-l-full last:rounded-r-full ${statusToneStyles[item.tone]}`}
                  style={{ width: `${item.percentage}%` }}
                >
                  <span aria-hidden="true" className="block h-3 w-full" />
                </ChartTooltip>
              ))}
            </div>
            <p className="mt-4 text-center"><span className="text-3xl font-bold">{total}</span><span className="ml-2 text-sm text-muted-foreground">total</span></p>
            <ul className="mt-5 space-y-3">
              {data.tripsByStatus.map((item) => (
                <li key={item.key} className="flex items-center gap-3 text-sm">
                  <span aria-hidden="true" className={`size-2.5 rounded-full ${statusToneStyles[item.tone]}`} />
                  <span className="min-w-0 flex-1 truncate">{item.label}</span>
                  <span className="font-semibold">{item.count}</span>
                  <span className="w-10 text-right text-muted-foreground">{item.percentage}%</span>
                </li>
              ))}
            </ul>
            <Link
              href={`/app/${organizationSlug}/planejamento/viagens?startsOn=${data.period.startDate}&endsOn=${data.period.endDate}`}
              className="mt-5 inline-flex text-sm font-semibold text-primary hover:underline"
            >
              Ver todas as viagens
            </Link>
          </>
        ) : (
          <p className="mt-5 rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">Não há viagens para distribuir por status.</p>
        )}
        </ChartCard>

        <ChartCard
          title="Distribuição por prioridade"
          description="Participação de cada prioridade no conjunto filtrado."
          className="xl:col-span-4"
        >
          {total ? (
            <div className="mt-5 space-y-4">
              {data.tripsByPriority.map((item) => (
                <div key={item.key}>
                  <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                    <span>{item.label}</span>
                    <span className="font-semibold">{item.count} <span className="font-normal text-muted-foreground">({item.percentage}%)</span></span>
                  </div>
                  <div className="h-2 rounded-full bg-muted">
                    <ChartTooltip
                      label={`${item.label}: ${item.count} (${item.percentage}%)`}
                      className="block h-2 rounded-full"
                      style={{ width: `${item.percentage}%` }}
                    >
                      <span aria-hidden="true" className={`block h-2 w-full rounded-full ${priorityToneStyles[item.tone]}`} />
                    </ChartTooltip>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-5 rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">Não há prioridades para analisar.</p>
          )}
        </ChartCard>

        <ChartCard
          title="Utilização dos recursos"
          description="Recursos ativos alocados e indisponíveis no período."
          className="xl:col-span-4"
        >
          <div className="mt-5 space-y-5">
            {data.resources.map((resource) => (
              <div key={resource.key} className="rounded-lg border border-border bg-muted/20 p-3">
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="text-sm font-semibold">{resource.label}</h3>
                  <span className="text-xs text-muted-foreground">{resource.totalActive} ativos</span>
                </div>
                <div className="mt-3 space-y-3">
                  <div>
                    <div className="mb-1 flex justify-between text-xs"><span>Alocados</span><span>{resource.allocated} · {resource.allocationPercentage}%</span></div>
                    <div className="h-2 rounded-full bg-muted"><ChartTooltip label={`${resource.label}: ${resource.allocated} alocados (${resource.allocationPercentage}%)`} className="block h-2 rounded-full" style={{ width: `${Math.min(100, resource.allocationPercentage)}%` }}><span aria-hidden="true" className="block h-2 w-full rounded-full bg-primary" /></ChartTooltip></div>
                  </div>
                  <div>
                    <div className="mb-1 flex justify-between text-xs"><span>Indisponíveis</span><span>{resource.unavailable} · {resource.unavailabilityPercentage}%</span></div>
                    <div className="h-2 rounded-full bg-muted"><ChartTooltip label={`${resource.label}: ${resource.unavailable} indisponíveis (${resource.unavailabilityPercentage}%)`} className="block h-2 rounded-full" style={{ width: `${Math.min(100, resource.unavailabilityPercentage)}%` }}><span aria-hidden="true" className="block h-2 w-full rounded-full bg-warning" /></ChartTooltip></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground" aria-label="Legenda da utilização dos recursos">
            <span className="inline-flex items-center gap-2"><span aria-hidden="true" className="size-2.5 rounded-full bg-primary" />Alocados</span>
            <span className="inline-flex items-center gap-2"><span aria-hidden="true" className="size-2.5 rounded-full bg-warning" />Indisponíveis</span>
          </div>
        </ChartCard>

        <ChartCard
          title="Alocação técnica"
          description="Horas alocadas por técnico, sem inferir produtividade ou capacidade."
          className="xl:col-span-4"
        >
          {data.topTechnicians.length ? (
            <div className="mt-5 space-y-4">
              {data.topTechnicians.map((technician) => (
                <div key={technician.id}>
                  <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                    <span className="min-w-0 truncate font-medium">{technician.name}</span>
                    <span className="shrink-0 text-xs text-muted-foreground">{technician.allocatedHours.toLocaleString("pt-BR")} h · {technician.tripCount} {technician.tripCount === 1 ? "viagem" : "viagens"}</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted">
                    <ChartTooltip
                      label={`${technician.name}: ${technician.allocatedHours.toLocaleString("pt-BR")} horas em ${technician.tripCount} ${technician.tripCount === 1 ? "viagem" : "viagens"}`}
                      className="block h-2 rounded-full"
                      style={{ width: `${technician.relativeLoad}%` }}
                    >
                      <span aria-hidden="true" className="block h-2 w-full rounded-full bg-info" />
                    </ChartTooltip>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-5 rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">Nenhum técnico alocado no período.</p>
          )}
        </ChartCard>
      </div>
    </section>
  );
}
