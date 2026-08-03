"use client";

import { AlertTriangle, CalendarOff, ExternalLink, X } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";

import { buttonStyles } from "@/components/ui/button";
import {
  formatSchedulePeriod,
} from "@/features/schedule/application/schedule-calendar";
import type {
  ScheduleCalendarLayout,
  ScheduleEvent,
  ScheduleEventSegment,
  ScheduleTripEvent,
} from "@/features/schedule/types/schedule";
import { TripPriorityBadge, TripStatusBadge, tripStatusPresentation } from "@/features/trips/components/trip-badges";

const hourHeight = 64;
const statusCardStyles: Record<ScheduleTripEvent["status"], string> = {
  draft: "border-border bg-muted/70",
  planned: "border-info/40 bg-info/10",
  confirmed: "border-success/40 bg-success/10",
  traveling: "border-info/50 bg-info/15",
  at_client: "border-primary/40 bg-accent",
  in_service: "border-warning/50 bg-warning/10",
  returning: "border-primary/40 bg-accent",
  finished: "border-border bg-muted/60",
  canceled: "border-destructive/35 bg-destructive/10",
};

function timeLabel(value: string, timezone: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: timezone,
  }).format(new Date(value));
}

function EventCard({
  segment,
  timezone,
  compact = false,
  onOpen,
}: {
  segment: ScheduleEventSegment;
  timezone: string;
  compact?: boolean;
  onOpen: (event: ScheduleEvent) => void;
}) {
  const event = segment.event;
  if (event.type !== "trip") {
    return (
      <button
        type="button"
        onClick={() => onOpen(event)}
        aria-label={`Indisponibilidade: ${event.typeName}, ${event.resourceName}`}
        className="h-full w-full overflow-hidden rounded-lg border border-warning/40 bg-warning/10 p-2 text-left text-xs transition hover:bg-warning/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span className="flex items-center gap-1 font-semibold text-foreground">
          <CalendarOff aria-hidden="true" className="size-3.5 shrink-0" />
          Indisponível
        </span>
        <span className="mt-1 block truncate text-muted-foreground">
          {event.typeName} · {event.resourceName}
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onOpen(event)}
      aria-label={`${event.code}, ${event.title}, ${tripStatusPresentation[event.status].label}`}
      className={`h-full w-full overflow-hidden rounded-lg border p-2 text-left text-xs shadow-sm transition hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${statusCardStyles[event.status]} ${event.conflictLabels.length ? "ring-2 ring-destructive/50" : ""}`}
    >
      <span className="flex items-center justify-between gap-1">
        <span className="truncate font-mono font-bold text-foreground">{event.code}</span>
        {event.conflictLabels.length ? <AlertTriangle aria-label="Conflito" className="size-3.5 shrink-0 text-destructive" /> : null}
      </span>
      <span className="mt-0.5 block truncate text-[10px] font-medium text-muted-foreground">
        {tripStatusPresentation[event.status].label}
        {event.conflictLabels.length ? " · Conflito" : ""}
      </span>
      <span className="mt-0.5 block truncate font-semibold text-foreground">{event.title}</span>
      {!compact ? (
        <>
          <span className="mt-1 block truncate text-muted-foreground">{event.clientName}</span>
          <span className="mt-1 block truncate text-muted-foreground">
            {timeLabel(segment.startsAt, timezone)}–{timeLabel(segment.endsAt, timezone)}
          </span>
          {event.responsibleName ? <span className="mt-1 block truncate text-muted-foreground">{event.responsibleName}</span> : null}
        </>
      ) : null}
    </button>
  );
}

function TripDetailsPanel({
  event,
  timezone,
  onClose,
}: {
  event: ScheduleEvent | null;
  timezone: string;
  onClose: () => void;
}) {
  if (!event) return null;
  if (event.type !== "trip") {
    return (
      <div className="space-y-5 p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div><p className="text-sm font-semibold text-warning">Indisponibilidade</p><h2 className="mt-1 text-xl font-bold">{event.resourceName}</h2></div>
          <button type="button" onClick={onClose} aria-label="Fechar detalhes" className="grid size-10 place-items-center rounded-lg text-muted-foreground hover:bg-muted"><X aria-hidden="true" className="size-5" /></button>
        </div>
        <dl className="grid gap-4 rounded-xl border border-border bg-card p-4">
          <div><dt className="text-xs text-muted-foreground">Tipo</dt><dd className="mt-1 font-medium">{event.typeName}</dd></div>
          <div><dt className="text-xs text-muted-foreground">Período</dt><dd className="mt-1 font-medium">{formatSchedulePeriod(event.startsAt, event.endsAt, timezone)}</dd></div>
          <div><dt className="text-xs text-muted-foreground">Motivo</dt><dd className="mt-1 font-medium">{event.reason || "Não informado"}</dd></div>
        </dl>
      </div>
    );
  }

  const rows = [
    ["Cliente", event.clientName],
    ["Unidade", event.unitName],
    ["Técnico responsável", event.responsibleName ?? "Não definido"],
    ["Equipe", event.technicianNames.join(", ") || "Não definida"],
    ["Veículo", event.vehicleLabel ?? "Não definido"],
    ["Motorista", event.driverName ?? "Não definido"],
    ["Período da viagem", formatSchedulePeriod(event.startsAt, event.endsAt, timezone)],
    ["Período do atendimento", event.serviceStartsAt && event.serviceEndsAt ? formatSchedulePeriod(event.serviceStartsAt, event.serviceEndsAt, timezone) : "Não definido"],
    ["Especialidades", event.requiredSkills.join(", ") || "Sem requisitos"],
    ["Pernoites", event.overnights === null ? "Não calculados" : String(event.overnights)],
  ];

  return (
    <div className="space-y-5 p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-muted-foreground">Detalhes da viagem</p>
          <h2 className="mt-1 text-xl font-bold">{event.code} — {event.title}</h2>
          <div className="mt-3 flex flex-wrap gap-2"><TripStatusBadge status={event.status} /><TripPriorityBadge priority={event.priority} /></div>
        </div>
        <button type="button" onClick={onClose} aria-label="Fechar detalhes" className="grid size-10 shrink-0 place-items-center rounded-lg text-muted-foreground hover:bg-muted"><X aria-hidden="true" className="size-5" /></button>
      </div>
      {event.conflictLabels.length ? <section className="rounded-xl border border-destructive/30 bg-destructive/10 p-4"><h3 className="flex items-center gap-2 font-semibold text-destructive"><AlertTriangle aria-hidden="true" className="size-4" />Conflitos</h3><ul className="mt-2 space-y-1 text-sm">{event.conflictLabels.map((item) => <li key={item}>• {item}</li>)}</ul></section> : null}
      {event.pendingLabels.length ? <section className="rounded-xl border border-warning/30 bg-warning/10 p-4"><h3 className="font-semibold text-warning">{event.pendingLabels.length} {event.pendingLabels.length === 1 ? "pendência" : "pendências"}</h3><ul className="mt-2 space-y-1 text-sm">{event.pendingLabels.map((item) => <li key={item}>• {item}</li>)}</ul></section> : null}
      <dl className="grid gap-4 rounded-xl border border-border bg-card p-4">
        {rows.map(([label, value]) => <div key={label}><dt className="text-xs font-medium text-muted-foreground">{label}</dt><dd className="mt-1 text-sm font-medium">{value}</dd></div>)}
      </dl>
      {event.notes || event.description ? <section className="rounded-xl border border-border bg-card p-4"><h3 className="font-semibold">Observações</h3><p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">{event.notes || event.description}</p></section> : null}
      <Link href={event.href} className={`${buttonStyles()} w-full`}><ExternalLink aria-hidden="true" className="size-4" />Abrir viagem</Link>
    </div>
  );
}

export function ScheduleCalendar({
  layout,
  timezone,
}: {
  layout: ScheduleCalendarLayout;
  timezone: string;
}) {
  const initialDay = layout.currentDayKey ?? layout.days[0]?.key ?? "";
  const [selectedDay, setSelectedDay] = useState(initialDay);
  const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const totalHeight = (layout.endHour - layout.startHour) * hourHeight;
  const hours = Array.from({ length: layout.endHour - layout.startHour + 1 }, (_, index) => layout.startHour + index);
  const allDaySegments = layout.segments.filter((segment) => segment.allDay);
  const timedSegments = layout.segments.filter((segment) => !segment.allDay);

  function open(event: ScheduleEvent) {
    setSelectedEvent(event);
    dialogRef.current?.showModal();
  }

  return (
    <>
      <section aria-label="Calendário semanal" className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="hidden overflow-x-auto lg:block">
          <div className="min-w-[80rem]">
            <div className="grid border-b border-border bg-muted/50" style={{ gridTemplateColumns: "4.5rem repeat(7,minmax(10rem,1fr))" }}>
              <div className="border-r border-border p-3 text-xs font-semibold text-muted-foreground">Horário</div>
              {layout.days.map((day) => <div key={day.key} className={`border-r border-border p-3 text-center last:border-r-0 ${day.isWeekend ? "bg-muted/40" : ""} ${day.isToday ? "bg-accent" : ""}`}><p className="text-xs font-semibold uppercase text-muted-foreground">{day.shortLabel}</p><p className="mt-1 font-bold">{day.dateLabel}</p>{day.isToday ? <span className="text-xs font-semibold text-primary">Hoje</span> : null}</div>)}
            </div>
            <div className="grid min-h-14 border-b border-border" style={{ gridTemplateColumns: "4.5rem repeat(7,minmax(10rem,1fr))" }}>
              <div className="border-r border-border p-2 text-xs font-medium text-muted-foreground">Dia inteiro</div>
              {layout.days.map((day) => <div key={day.key} className={`space-y-1 border-r border-border p-1.5 last:border-r-0 ${day.isWeekend ? "bg-muted/20" : ""}`}>{allDaySegments.filter((segment) => segment.dayKey === day.key).map((segment) => <EventCard key={segment.segmentId} segment={segment} timezone={timezone} compact onOpen={open} />)}</div>)}
            </div>
            <div className="grid" style={{ gridTemplateColumns: "4.5rem repeat(7,minmax(10rem,1fr))" }}>
              <div className="relative border-r border-border" style={{ height: totalHeight }}>
                {hours.map((hour) => <span key={hour} className="absolute right-2 -translate-y-1/2 text-[11px] text-muted-foreground" style={{ top: (hour - layout.startHour) * hourHeight }}>{String(hour).padStart(2, "0")}:00</span>)}
              </div>
              {layout.days.map((day) => {
                const nowVisible = day.key === layout.currentDayKey && layout.currentMinute !== null && layout.currentMinute >= layout.startHour * 60 && layout.currentMinute <= layout.endHour * 60;
                return <div key={day.key} className={`relative border-r border-border last:border-r-0 ${day.isWeekend ? "bg-muted/15" : ""} ${day.isToday ? "bg-accent/20" : ""}`} style={{ height: totalHeight }}>
                  {hours.map((hour) => <span key={hour} aria-hidden="true" className="absolute inset-x-0 border-t border-border/70" style={{ top: (hour - layout.startHour) * hourHeight }} />)}
                  {timedSegments.filter((segment) => segment.dayKey === day.key).map((segment) => {
                    const top = ((segment.startMinute - layout.startHour * 60) / 60) * hourHeight;
                    const height = Math.max(28, ((segment.endMinute - segment.startMinute) / 60) * hourHeight);
                    const width = 100 / segment.laneCount;
                    return <div key={segment.segmentId} className="absolute px-1 py-0.5" style={{ top, height, left: `${segment.lane * width}%`, width: `${width}%` }}><EventCard segment={segment} timezone={timezone} compact={height < 70} onOpen={open} /></div>;
                  })}
                  {nowVisible ? (
                    <div
                      className="pointer-events-none absolute inset-x-0 z-20 border-t-2 border-destructive"
                      style={{ top: ((layout.currentMinute! - layout.startHour * 60) / 60) * hourHeight }}
                    >
                      <span className="absolute -left-1 -top-1 size-2 rounded-full bg-destructive" />
                      <span className="absolute right-1 -top-5 rounded bg-background/90 px-1 text-[10px] font-semibold text-destructive">
                        Agora {String(Math.floor(layout.currentMinute! / 60)).padStart(2, "0")}:
                        {String(layout.currentMinute! % 60).padStart(2, "0")}
                      </span>
                    </div>
                  ) : null}
                </div>;
              })}
            </div>
          </div>
        </div>

        <div className="lg:hidden">
          <div className="flex gap-1 overflow-x-auto border-b border-border bg-muted/40 p-2">
            {layout.days.map((day) => <button key={day.key} type="button" onClick={() => setSelectedDay(day.key)} aria-pressed={selectedDay === day.key} className={`min-w-16 rounded-lg px-2 py-2 text-center text-xs font-semibold ${selectedDay === day.key ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground"}`}><span className="block uppercase">{day.shortLabel}</span><span className="mt-1 block">{day.dateLabel}</span>{day.isToday ? <span className="sr-only">Hoje</span> : null}</button>)}
          </div>
          <div className="p-3">
            <h2 className="font-semibold">{layout.days.find((day) => day.key === selectedDay)?.longLabel}</h2>
            <div className="mt-3 space-y-2">
              {layout.segments.filter((segment) => segment.dayKey === selectedDay).sort((a, b) => Number(b.allDay) - Number(a.allDay) || a.startMinute - b.startMinute).map((segment) => <div key={segment.segmentId} className="grid grid-cols-[3.5rem_minmax(0,1fr)] gap-2"><span className="pt-2 text-xs font-medium text-muted-foreground">{segment.allDay ? "Dia todo" : timeLabel(segment.startsAt, timezone)}</span><EventCard segment={segment} timezone={timezone} onOpen={open} /></div>)}
              {!layout.segments.some((segment) => segment.dayKey === selectedDay) ? <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">Nenhuma programação neste dia.</p> : null}
            </div>
          </div>
        </div>
      </section>

      <dialog ref={dialogRef} aria-label="Detalhes do evento" onClose={() => setSelectedEvent(null)} onClick={(event) => { if (event.target === dialogRef.current) dialogRef.current?.close(); }} className="m-0 ml-auto h-dvh max-h-none w-[min(34rem,94vw)] max-w-none overflow-y-auto border-l border-border bg-popover p-0 text-popover-foreground shadow-2xl backdrop:bg-background/70">
        <TripDetailsPanel event={selectedEvent} timezone={timezone} onClose={() => dialogRef.current?.close()} />
      </dialog>
    </>
  );
}
