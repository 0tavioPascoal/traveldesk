import type { CSSProperties, ReactNode } from "react";

import { SectionHeader } from "@/components/page/section-header";
import type {
  AnalyticsChartPoint,
  AnalyticsData,
  AnalyticsStatusPoint,
} from "@/features/analytics/types/analytics";

const statusToneStyles: Record<AnalyticsStatusPoint["tone"], string> = {
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
  className,
  children,
}: {
  title: string;
  description: string;
  className: string;
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
  className = "",
  style,
  children,
}: {
  label: string;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
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
        className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-2 hidden w-max max-w-56 -translate-x-1/2 rounded-md border border-border bg-popover px-2.5 py-1.5 text-xs font-medium text-popover-foreground shadow-lg group-hover:block group-focus:block"
      >
        {label}
      </span>
    </span>
  );
}

function EmptyChart({ children }: { children: ReactNode }) {
  return (
    <div className="mt-5 grid min-h-64 place-items-center rounded-lg border border-dashed border-border px-5 text-center text-sm text-muted-foreground">
      {children}
    </div>
  );
}

function ChartLegend({ label, tone = "bg-primary" }: { label: string; tone?: string }) {
  return (
    <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
      <span aria-hidden="true" className={`size-2.5 rounded-full ${tone}`} />
      {label}
    </div>
  );
}

function HorizontalBars({
  points,
  emptyMessage,
}: {
  points: AnalyticsChartPoint[];
  emptyMessage: string;
}) {
  if (!points.length) return <EmptyChart>{emptyMessage}</EmptyChart>;
  const maximum = Math.max(1, ...points.map((point) => point.value));
  return (
    <>
      <div className="mt-5 space-y-3.5">
        {points.map((point) => (
          <div key={point.key}>
            <div className="mb-1.5 flex items-center justify-between gap-4 text-sm">
              <span className="min-w-0 truncate font-medium" title={point.label}>{point.label}</span>
              <span className="shrink-0 font-semibold">{point.value}</span>
            </div>
            <div className="h-2.5 rounded-full bg-muted">
              <ChartTooltip
                label={`${point.label}: ${point.value} ${point.value === 1 ? "viagem" : "viagens"}`}
                className="block h-2.5 rounded-full"
                style={{ width: `${Math.max(2, (point.value / maximum) * 100)}%` }}
              >
                <span aria-hidden="true" className="block h-2.5 w-full rounded-full bg-primary" />
              </ChartTooltip>
            </div>
          </div>
        ))}
      </div>
      <ChartLegend label="Viagens distintas" />
      <ul className="sr-only">
        {points.map((point) => <li key={point.key}>{point.label}: {point.value} viagens</li>)}
      </ul>
    </>
  );
}

export function AnalyticsCharts({ data }: { data: AnalyticsData }) {
  const timelineMaximum = Math.max(1, ...data.tripsByPeriod.map((point) => point.value));
  const totalStatus = data.tripsByStatus.reduce((total, point) => total + point.value, 0);
  const compactTimeline = data.tripsByPeriod.length > 14;
  const priorityMaximum = Math.max(1, ...data.tripsByPriority.map((point) => point.value));
  const resourceMaximum = Math.max(
    1,
    ...data.resourceUsage.flatMap((point) => [point.active, point.used]),
  );

  return (
    <div className="grid min-w-0 grid-cols-12 gap-4">
      <ChartCard
        title="Viagens por período"
        description="Uma viagem é contada em cada intervalo em que permanece ativa."
        className="col-span-12 xl:col-span-8"
      >
        {data.totalTrips ? (
          <>
            <div
              className="mt-6 grid h-64 items-end gap-1 border-b border-border sm:gap-2"
              style={{ gridTemplateColumns: `repeat(${data.tripsByPeriod.length}, minmax(0, 1fr))` }}
            >
              {data.tripsByPeriod.map((point, index) => (
                <div key={point.key} className="flex h-full min-w-0 flex-col justify-end gap-2">
                  <span className="text-center text-[10px] font-semibold text-muted-foreground">{point.value}</span>
                  <ChartTooltip
                    label={`${point.tooltipLabel}: ${point.value} ${point.value === 1 ? "viagem" : "viagens"}`}
                    className="block min-h-1 rounded-t"
                    style={{ height: `${Math.max(point.value ? 8 : 2, (point.value / timelineMaximum) * 100)}%` }}
                  >
                    <span aria-hidden="true" className="block size-full rounded-t bg-primary/80 transition group-hover:bg-primary" />
                  </ChartTooltip>
                  <span className="truncate text-center text-[9px] text-muted-foreground sm:text-[10px]">
                    {!compactTimeline || index % 3 === 0 ? point.label : "·"}
                  </span>
                </div>
              ))}
            </div>
            <ChartLegend label="Viagens ativas no intervalo" />
            <ul className="sr-only">
              {data.tripsByPeriod.map((point) => (
                <li key={point.key}>{point.tooltipLabel}: {point.value} viagens</li>
              ))}
            </ul>
          </>
        ) : <EmptyChart>Nenhuma viagem encontrada no período selecionado.</EmptyChart>}
      </ChartCard>

      <ChartCard
        title="Distribuição por status"
        description="Estados de execução agrupados apenas para apresentação gráfica."
        className="col-span-12 xl:col-span-4"
      >
        {totalStatus ? (
          <>
            <div className="mt-6 flex h-4 rounded-full bg-muted">
              {data.tripsByStatus.filter((point) => point.value > 0).map((point) => (
                <ChartTooltip
                  key={point.key}
                  label={`${point.label}: ${point.value} (${point.percentage}%)`}
                  className={`block first:rounded-l-full last:rounded-r-full ${statusToneStyles[point.tone]}`}
                  style={{ flexBasis: 0, flexGrow: point.value }}
                >
                  <span aria-hidden="true" className="block h-4 w-full" />
                </ChartTooltip>
              ))}
            </div>
            <ul className="mt-6 space-y-3">
              {data.tripsByStatus.map((point) => (
                <li key={point.key} className="flex items-center gap-3 text-sm">
                  <span aria-hidden="true" className={`size-2.5 rounded-full ${statusToneStyles[point.tone]}`} />
                  <span className="min-w-0 flex-1 truncate">{point.label}</span>
                  <span className="font-semibold">{point.value}</span>
                  <span className="w-10 text-right text-muted-foreground">{point.percentage}%</span>
                </li>
              ))}
            </ul>
          </>
        ) : <EmptyChart>Não há viagens para distribuir por status.</EmptyChart>}
      </ChartCard>

      <ChartCard
        title="Viagens por cliente"
        description="Até dez clientes, ordenados pela quantidade de viagens no período."
        className="col-span-12 xl:col-span-6"
      >
        <HorizontalBars points={data.tripsByClient} emptyMessage="Nenhum cliente possui viagens no período." />
      </ChartCard>

      <ChartCard
        title="Viagens por tipo de atendimento"
        description="Distribuição pelos tipos efetivamente vinculados às viagens."
        className="col-span-12 xl:col-span-6"
      >
        <HorizontalBars points={data.tripsByServiceType} emptyMessage="Não há viagens associadas a tipos de atendimento no período." />
      </ChartCard>

      <ChartCard
        title="Viagens por prioridade"
        description="Quantidade real em cada prioridade cadastrada no domínio."
        className="col-span-12 xl:col-span-5"
      >
        {data.totalTrips ? (
          <>
            <div className="mt-6 grid h-64 grid-cols-4 items-end gap-3 border-b border-border sm:gap-5">
              {data.tripsByPriority.map((point) => (
                <div key={point.key} className="flex h-full min-w-0 flex-col justify-end gap-2">
                  <span className="text-center text-xs font-semibold">{point.value}</span>
                  <ChartTooltip
                    label={`${point.label}: ${point.value} ${point.value === 1 ? "viagem" : "viagens"}`}
                    className="block min-h-1 rounded-t"
                    style={{ height: `${Math.max(point.value ? 8 : 2, (point.value / priorityMaximum) * 100)}%` }}
                  >
                    <span aria-hidden="true" className={`block size-full rounded-t ${priorityToneStyles[point.tone]}`} />
                  </ChartTooltip>
                  <span className="truncate text-center text-xs text-muted-foreground">{point.label}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-3 text-xs text-muted-foreground">
              {data.tripsByPriority.map((point) => (
                <span key={point.key} className="inline-flex items-center gap-1.5">
                  <span aria-hidden="true" className={`size-2.5 rounded-full ${priorityToneStyles[point.tone]}`} />{point.label}
                </span>
              ))}
            </div>
            <ul className="sr-only">
              {data.tripsByPriority.map((point) => <li key={point.key}>{point.label}: {point.value} viagens</li>)}
            </ul>
          </>
        ) : <EmptyChart>Não há viagens para distribuir por prioridade.</EmptyChart>}
      </ChartCard>

      <ChartCard
        title="Utilização dos recursos"
        description="Compara recursos ativos no cadastro e recursos distintos utilizados em viagens não canceladas."
        className="col-span-12 xl:col-span-7"
      >
        {data.resourceUsage.some((point) => point.active || point.used) ? (
          <>
            <div className="mt-6 grid h-64 grid-cols-2 items-end gap-8 border-b border-border px-4 sm:px-12">
              {data.resourceUsage.map((point) => (
                <div key={point.key} className="grid h-full grid-cols-2 items-end gap-3 sm:gap-5">
                  <div className="flex h-full flex-col justify-end gap-2">
                    <span className="text-center text-xs font-semibold">{point.active}</span>
                    <ChartTooltip label={`${point.label} ativos: ${point.active}`} className="block min-h-1 rounded-t" style={{ height: `${Math.max(point.active ? 8 : 2, (point.active / resourceMaximum) * 100)}%` }}>
                      <span aria-hidden="true" className="block size-full rounded-t bg-muted-foreground" />
                    </ChartTooltip>
                  </div>
                  <div className="flex h-full flex-col justify-end gap-2">
                    <span className="text-center text-xs font-semibold">{point.used}</span>
                    <ChartTooltip label={`${point.label} utilizados: ${point.used}`} className="block min-h-1 rounded-t" style={{ height: `${Math.max(point.used ? 8 : 2, (point.used / resourceMaximum) * 100)}%` }}>
                      <span aria-hidden="true" className="block size-full rounded-t bg-primary" />
                    </ChartTooltip>
                  </div>
                  <span className="col-span-2 truncate text-center text-xs text-muted-foreground">{point.label}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-2"><span aria-hidden="true" className="size-2.5 rounded-full bg-muted-foreground" />Ativos</span>
              <span className="inline-flex items-center gap-2"><span aria-hidden="true" className="size-2.5 rounded-full bg-primary" />Utilizados</span>
            </div>
            <ul className="sr-only">
              {data.resourceUsage.map((point) => <li key={point.key}>{point.label}: {point.active} ativos e {point.used} utilizados</li>)}
            </ul>
          </>
        ) : <EmptyChart>Nenhum recurso foi utilizado no período.</EmptyChart>}
      </ChartCard>

      <ChartCard
        title="Viagens por técnico"
        description="Até dez técnicos por quantidade de vínculos distintos em viagens não canceladas."
        className="col-span-12 xl:col-span-6"
      >
        <HorizontalBars points={data.tripsByTechnician} emptyMessage="Nenhum técnico foi alocado no período." />
      </ChartCard>

      <ChartCard
        title="Utilização de veículos"
        description="Até dez veículos por quantidade de viagens distintas não canceladas."
        className="col-span-12 xl:col-span-6"
      >
        <HorizontalBars points={data.tripsByVehicle} emptyMessage="Nenhum veículo foi utilizado no período." />
      </ChartCard>
    </div>
  );
}
