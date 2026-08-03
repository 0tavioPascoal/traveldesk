"use client";

import { BarChart3, CalendarRange, RefreshCw, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useTransition } from "react";

import { listControlStyles } from "@/components/list-page/list-controls";
import { ListFilterDialog } from "@/components/list-page/list-filter-dialog";
import { Button, buttonStyles } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import type { AnalyticsFilters, AnalyticsOptions } from "@/features/analytics/types/analytics";
import { tripStatusPresentation } from "@/features/trips/components/trip-badges";

const periodLabels = {
  today: "Hoje",
  week: "Esta semana",
  last7: "Últimos 7 dias",
  last30: "Últimos 30 dias",
  last90: "Últimos 90 dias",
  custom: "Período personalizado",
} as const;

const priorityLabels = {
  low: "Baixa",
  normal: "Normal",
  high: "Alta",
  urgent: "Urgente",
} as const;

function filterParams(filters: AnalyticsFilters) {
  const params = new URLSearchParams({ period: filters.period });
  if (filters.period === "custom") {
    params.set("startDate", filters.startDate);
    params.set("endDate", filters.endDate);
  }
  for (const key of [
    "clientId",
    "unitId",
    "status",
    "priority",
    "technicianId",
    "vehicleId",
    "serviceTypeId",
  ] as const) {
    if (filters[key] !== "all") params.set(key, filters[key]);
  }
  return params;
}

function SelectField({
  id,
  name,
  label,
  defaultValue,
  children,
}: {
  id: string;
  name: string;
  label: string;
  defaultValue: string;
  children: ReactNode;
}) {
  return (
    <label htmlFor={id} className="min-w-0 space-y-1.5 text-sm font-medium">
      <span className="block">{label}</span>
      <select id={id} name={name} defaultValue={defaultValue} className={listControlStyles}>
        {children}
      </select>
    </label>
  );
}

export function AnalyticsControls({
  organizationSlug,
  filters,
  options,
  timezone,
}: {
  organizationSlug: string;
  filters: AnalyticsFilters;
  options: AnalyticsOptions;
  timezone: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const path = `/app/${organizationSlug}/analises`;
  const activeCount = [
    filters.clientId,
    filters.unitId,
    filters.status,
    filters.priority,
    filters.technicianId,
    filters.vehicleId,
    filters.serviceTypeId,
  ].filter((value) => value !== "all").length;
  const clearParams = new URLSearchParams({ period: filters.period });
  if (filters.period === "custom") {
    clearParams.set("startDate", filters.startDate);
    clearParams.set("endDate", filters.endDate);
  }

  function changePeriod(period: string) {
    const params = filterParams(filters);
    params.set("period", period);
    if (period === "custom") {
      params.set("startDate", filters.startDate);
      params.set("endDate", filters.endDate);
    } else {
      params.delete("startDate");
      params.delete("endDate");
    }
    startTransition(() => router.push(`${path}?${params}`));
  }

  return (
    <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
      <label htmlFor="analytics-period" className="sr-only">Período das análises</label>
      <div className="relative min-w-52 flex-1 sm:flex-none">
        <CalendarRange aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <select
          id="analytics-period"
          value={filters.period}
          disabled={pending}
          onChange={(event) => changePeriod(event.target.value)}
          className={`${listControlStyles} pl-9`}
        >
          {Object.entries(periodLabels).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      <ListFilterDialog
        action={path}
        title="Filtrar análises"
        description="Refine todos os gráficos com os mesmos critérios."
        activeCount={activeCount}
        clearHref={`${path}?${clearParams}`}
      >
        <div className="grid items-start gap-4 sm:grid-cols-2">
          <SelectField id="analytics-filter-period" name="period" label="Período" defaultValue={filters.period}>
            {Object.entries(periodLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </SelectField>
          <div className="hidden sm:block" aria-hidden="true" />
          <DatePicker id="analytics-start-date" name="startDate" label="Data inicial" defaultValue={filters.startDate} timezone={timezone} />
          <DatePicker id="analytics-end-date" name="endDate" label="Data final" defaultValue={filters.endDate} timezone={timezone} />
          <SelectField id="analytics-client" name="clientId" label="Cliente" defaultValue={filters.clientId}>
            <option value="all">Todos</option>
            {options.clients.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
          </SelectField>
          <SelectField id="analytics-unit" name="unitId" label="Unidade" defaultValue={filters.unitId}>
            <option value="all">Todas</option>
            {options.units.map((option) => {
              const client = options.clients.find((item) => item.id === option.clientId)?.label;
              return <option key={option.id} value={option.id}>{option.label}{client ? ` — ${client}` : ""}</option>;
            })}
          </SelectField>
          <SelectField id="analytics-status" name="status" label="Status" defaultValue={filters.status}>
            <option value="all">Todos</option>
            {Object.entries(tripStatusPresentation).map(([value, item]) => (
              <option key={value} value={value}>{item.label}</option>
            ))}
          </SelectField>
          <SelectField id="analytics-priority" name="priority" label="Prioridade" defaultValue={filters.priority}>
            <option value="all">Todas</option>
            {Object.entries(priorityLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </SelectField>
          <SelectField id="analytics-technician" name="technicianId" label="Técnico" defaultValue={filters.technicianId}>
            <option value="all">Todos</option>
            {options.technicians.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
          </SelectField>
          <SelectField id="analytics-vehicle" name="vehicleId" label="Veículo" defaultValue={filters.vehicleId}>
            <option value="all">Todos</option>
            {options.vehicles.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
          </SelectField>
          <SelectField id="analytics-service-type" name="serviceTypeId" label="Tipo de atendimento" defaultValue={filters.serviceTypeId}>
            <option value="all">Todos</option>
            {options.serviceTypes.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
          </SelectField>
        </div>
      </ListFilterDialog>

      <Button
        type="button"
        variant="secondary"
        size="sm"
        disabled={pending}
        aria-busy={pending}
        onClick={() => startTransition(() => router.refresh())}
      >
        <RefreshCw aria-hidden="true" className={`size-4 ${pending ? "animate-spin" : ""}`} />
        <span className="hidden sm:inline">{pending ? "Atualizando..." : "Atualizar"}</span>
        <span className="sr-only sm:hidden">{pending ? "Atualizando análises" : "Atualizar análises"}</span>
      </Button>
    </div>
  );
}

export function AnalyticsActiveFilters({
  organizationSlug,
  filters,
  options,
}: {
  organizationSlug: string;
  filters: AnalyticsFilters;
  options: AnalyticsOptions;
}) {
  const path = `/app/${organizationSlug}/analises`;
  const definitions = [
    { key: "clientId" as const, label: "Cliente", value: options.clients.find((item) => item.id === filters.clientId)?.label },
    { key: "unitId" as const, label: "Unidade", value: options.units.find((item) => item.id === filters.unitId)?.label },
    { key: "status" as const, label: "Status", value: filters.status === "all" ? undefined : tripStatusPresentation[filters.status].label },
    { key: "priority" as const, label: "Prioridade", value: filters.priority === "all" ? undefined : priorityLabels[filters.priority] },
    { key: "technicianId" as const, label: "Técnico", value: options.technicians.find((item) => item.id === filters.technicianId)?.label },
    { key: "vehicleId" as const, label: "Veículo", value: options.vehicles.find((item) => item.id === filters.vehicleId)?.label },
    { key: "serviceTypeId" as const, label: "Tipo", value: options.serviceTypes.find((item) => item.id === filters.serviceTypeId)?.label },
  ].filter((item): item is typeof item & { value: string } => Boolean(item.value));
  if (!definitions.length) return null;
  const clearParams = new URLSearchParams({ period: filters.period });
  if (filters.period === "custom") {
    clearParams.set("startDate", filters.startDate);
    clearParams.set("endDate", filters.endDate);
  }

  return (
    <div className="flex flex-wrap items-center gap-2" aria-label="Filtros ativos">
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <BarChart3 aria-hidden="true" className="size-3.5" /> Filtros ativos:
      </span>
      {definitions.map((definition) => {
        const params = filterParams(filters);
        params.delete(definition.key);
        if (definition.key === "clientId") params.delete("unitId");
        return (
          <Link
            key={definition.key}
            href={`${path}?${params}`}
            aria-label={`Remover filtro ${definition.label}: ${definition.value}`}
            className="inline-flex min-h-8 max-w-full items-center gap-1.5 rounded-full border border-border bg-muted/40 px-2.5 text-xs text-foreground outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="truncate">{definition.label}: {definition.value}</span>
            <X aria-hidden="true" className="size-3.5 shrink-0" />
          </Link>
        );
      })}
      <Link href={`${path}?${clearParams}`} className={buttonStyles({ variant: "ghost", size: "sm" })}>
        Limpar todos
      </Link>
    </div>
  );
}
