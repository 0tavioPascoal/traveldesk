import { History } from "lucide-react";

import { SectionHeader } from "@/components/page/section-header";
import { TripStatusBadge } from "@/features/trips/components/trip-badges";
import type { TripExecutionSummary } from "@/features/trips/types/trip-execution";

function dateTime(value: string, timezone: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium", timeStyle: "short", timeZone: timezone,
  }).format(new Date(value));
}

export function TripHistorySection({ summary, timezone }: { summary: TripExecutionSummary; timezone: string }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <SectionHeader title="Histórico de status" description="Registro cronológico das confirmações, transições operacionais e cancelamentos." />
      {summary.history.length === 0 ? (
        <div className="mt-5 flex items-start gap-3 rounded-xl bg-muted p-4 text-sm text-muted-foreground">
          <History aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          Nenhuma transição de status foi registrada para esta viagem.
        </div>
      ) : (
        <ol className="mt-6 space-y-0" aria-label="Histórico de status da viagem">
          {summary.history.map((item, index) => (
            <li key={item.id} className="relative grid grid-cols-[1.25rem_1fr] gap-3 pb-6 last:pb-0">
              {index < summary.history.length - 1 ? <span aria-hidden="true" className="absolute bottom-0 left-[0.34rem] top-3 w-px bg-border" /> : null}
              <span aria-hidden="true" className="relative mt-1 size-3 rounded-full border-2 border-card bg-primary ring-2 ring-primary/20" />
              <article className="min-w-0 rounded-xl border border-border bg-muted/35 p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <TripStatusBadge status={item.toStatus} />
                  <time dateTime={item.occurredAt} className="text-xs text-subtle-foreground">{dateTime(item.occurredAt, timezone)}</time>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">Registrado por <span className="font-medium text-foreground">{item.changedByName}</span></p>
                {item.note ? <p className="mt-3 whitespace-pre-wrap rounded-lg bg-card p-3 text-sm leading-6 text-muted-foreground">{item.note}</p> : null}
              </article>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
