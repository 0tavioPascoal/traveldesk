"use client";

import { CalendarRange } from "lucide-react";

import { listControlStyles } from "@/components/list-page/list-controls";
import { ListFilterDialog } from "@/components/list-page/list-filter-dialog";
import { buttonStyles } from "@/components/ui/button";
import type { DashboardFilters as Filters } from "@/features/dashboard/types/operational-dashboard";
import { tripStatusPresentation } from "@/features/trips/components/trip-badges";

const periodLabels = {
  today: "Hoje",
  week: "Esta semana",
  next7: "Próximos 7 dias",
  next30: "Próximos 30 dias",
} as const;
const priorityLabels = {
  low: "Baixa",
  normal: "Normal",
  high: "Alta",
  urgent: "Urgente",
} as const;

export function DashboardFilters({
  organizationSlug,
  filters,
  periodLabel,
}: {
  organizationSlug: string;
  filters: Filters;
  periodLabel: string;
}) {
  const path = `/app/${organizationSlug}/dashboard`;
  const activeCount = Number(filters.status !== "all") +
    Number(filters.priority !== "all");

  return (
    <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
      <form action={path} className="flex min-w-0 items-center gap-2">
        <input type="hidden" name="status" value={filters.status} />
        <input type="hidden" name="priority" value={filters.priority} />
        <label htmlFor="dashboard-period" className="sr-only">
          Período do dashboard
        </label>
        <div className="relative min-w-0 flex-1 sm:min-w-48">
          <CalendarRange aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <select
            id="dashboard-period"
            name="period"
            defaultValue={filters.period}
            aria-describedby="dashboard-period-description"
            className={`${listControlStyles} pl-9`}
          >
            {Object.entries(periodLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
        <button type="submit" className={buttonStyles({ variant: "secondary", size: "sm" })}>
          Aplicar
        </button>
        <span id="dashboard-period-description" className="sr-only">
          Período atual: {periodLabel}
        </span>
      </form>

      <ListFilterDialog
        action={path}
        title="Filtrar dashboard"
        description="Refine os indicadores e gráficos por status e prioridade."
        activeCount={activeCount}
        clearHref={`${path}?period=${filters.period}`}
      >
        <input type="hidden" name="period" value={filters.period} />
        <div className="grid items-start gap-4 sm:grid-cols-2">
          <label className="space-y-1.5 text-sm font-medium">
            <span className="block">Status</span>
            <select name="status" defaultValue={filters.status} className={listControlStyles}>
              <option value="all">Todos</option>
              {Object.entries(tripStatusPresentation).map(([value, item]) => (
                <option key={value} value={value}>{item.label}</option>
              ))}
            </select>
          </label>
          <label className="space-y-1.5 text-sm font-medium">
            <span className="block">Prioridade</span>
            <select name="priority" defaultValue={filters.priority} className={listControlStyles}>
              <option value="all">Todas</option>
              {Object.entries(priorityLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </label>
        </div>
      </ListFilterDialog>
    </div>
  );
}
