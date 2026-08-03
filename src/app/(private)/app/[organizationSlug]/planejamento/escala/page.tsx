import { AlertTriangle, CalendarDays, CarFront, Plus, UsersRound } from "lucide-react";

import { PageContainer } from "@/components/page/page-container";
import { PageHeader } from "@/components/page/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { InlineAlert } from "@/components/ui/inline-alert";
import {
  buildScheduleCalendarLayout,
} from "@/features/schedule/application/schedule-calendar";
import { ScheduleCalendar } from "@/features/schedule/components/schedule-calendar";
import { ScheduleControls } from "@/features/schedule/components/schedule-controls";
import { getWeeklySchedule } from "@/features/schedule/queries/get-weekly-schedule";
import { scheduleFilterSchema } from "@/features/schedule/schemas/schedule-filter-schema";

type Props = {
  params: Promise<{ organizationSlug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SchedulePage({ params, searchParams }: Props) {
  const { organizationSlug } = await params;
  const parsed = scheduleFilterSchema.parse(await searchParams);
  const data = await getWeeklySchedule(organizationSlug, {
    week: parsed.week,
    query: parsed.q,
    status: parsed.status,
    technicianId: parsed.technicianId,
    vehicleId: parsed.vehicleId,
    showConflicts: parsed.showConflicts,
    showUnavailabilities: parsed.showUnavailabilities,
  });
  const layout = buildScheduleCalendarLayout(
    data.events,
    data.weekStart,
    data.timezone,
    new Date(data.generatedAt),
  );
  const rangeLabel = `${layout.days[0]?.dateLabel ?? ""} — ${layout.days[6]?.dateLabel ?? ""}`;
  const hasFilters = Boolean(
    data.filters.query ||
    data.filters.status !== "all" ||
    data.filters.technicianId ||
    data.filters.vehicleId ||
    data.filters.showConflicts ||
    !data.filters.showUnavailabilities,
  );
  const basePath = `/app/${organizationSlug}/planejamento/escala?week=${data.weekStart}`;
  const metrics = [
    { label: "Viagens na semana", value: data.metrics.trips, icon: CalendarDays, tone: "text-primary bg-accent" },
    { label: "Técnicos alocados", value: data.metrics.allocatedTechnicians, icon: UsersRound, tone: "text-info bg-info/10" },
    { label: "Conflitos identificados", value: data.metrics.conflicts, icon: AlertTriangle, tone: data.metrics.conflicts ? "text-destructive bg-destructive/10" : "text-muted-foreground bg-muted" },
    { label: "Veículos ocupados", value: data.metrics.occupiedVehicles, icon: CarFront, tone: "text-success bg-success/10" },
  ];

  return (
    <PageContainer className="space-y-4">
      <PageHeader
        title="Escalas"
        description="Visualize as viagens, equipes, veículos e indisponibilidades da semana."
        breadcrumbs={[
          { label: "Planejamento" },
          { label: "Escalas" },
        ]}
      />
      <section aria-label="Resumo da semana" className="grid grid-cols-2 gap-2 xl:grid-cols-4">
        {metrics.map(({ label, value, icon: Icon, tone }) => (
          <div key={label} className="flex min-w-0 items-center gap-3 rounded-xl border border-border bg-card p-3">
            <span className={`grid size-9 shrink-0 place-items-center rounded-lg ${tone}`}><Icon aria-hidden="true" className="size-4" /></span>
            <div className="min-w-0"><p className="text-xl font-bold">{value}</p><p className="truncate text-xs text-muted-foreground">{label}</p></div>
          </div>
        ))}
      </section>
      <div className="flex items-center justify-between gap-3">
        <div><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Semana</p><p className="font-semibold">{rangeLabel}</p></div>
        <p className="hidden text-xs text-muted-foreground sm:block">Timezone: {data.timezone}</p>
      </div>
      <ScheduleControls
        organizationSlug={organizationSlug}
        timezone={data.timezone}
        generatedAt={data.generatedAt}
        filters={data.filters}
        technicians={data.technicians}
        vehicles={data.vehicles}
      />
      {data.limited ? (
        <InlineAlert tone="warning">
          A semana excede o limite seguro da escala. Consulte as listagens operacionais para visualizar os demais registros.
        </InlineAlert>
      ) : null}
      {data.events.length > 0 ? (
        <ScheduleCalendar layout={layout} timezone={data.timezone} />
      ) : data.technicians.length === 0 && data.vehicles.length === 0 ? (
        <EmptyState
          title="Ainda não há recursos cadastrados"
          description="Cadastre técnicos e veículos para começar a organizar a escala."
        />
      ) : (
        <EmptyState
          title="Nenhuma programação encontrada nesta semana"
          description="Não há viagens ou indisponibilidades para os filtros selecionados."
          action={hasFilters
            ? { href: basePath, label: "Limpar filtros" }
            : { href: `/app/${organizationSlug}/planejamento/viagens/nova`, label: "Nova viagem" }}
          icon={hasFilters ? CalendarDays : Plus}
        />
      )}
    </PageContainer>
  );
}
