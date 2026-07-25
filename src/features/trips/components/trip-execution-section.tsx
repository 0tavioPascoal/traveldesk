import { CheckCircle2, CircleStop, Clock3 } from "lucide-react";

import { SectionHeader } from "@/components/page/section-header";
import { InlineAlert } from "@/components/ui/inline-alert";
import { TripStatusBadge } from "@/features/trips/components/trip-badges";
import type { TripExecutionSummary } from "@/features/trips/types/trip-execution";

const statusDescription = {
  draft: "A viagem ainda está em rascunho e não iniciou o fluxo operacional.",
  planned: "A viagem está em planejamento e precisa ser confirmada antes da execução.",
  confirmed: "A programação está confirmada e aguarda o início do deslocamento.",
  traveling: "A equipe está em deslocamento para o cliente.",
  at_client: "A equipe chegou à unidade do cliente.",
  in_service: "O atendimento técnico está em execução.",
  returning: "A equipe iniciou o retorno.",
  finished: "A viagem foi concluída operacionalmente.",
  canceled: "A viagem foi cancelada e não aceita novas transições.",
} as const;

function dateTime(value: string, timezone: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium", timeStyle: "short", timeZone: timezone,
  }).format(new Date(value));
}

export function TripExecutionSection({ summary, timezone }: {
  summary: TripExecutionSummary;
  timezone: string;
}) {
  const terminal = summary.currentStatus === "finished" || summary.currentStatus === "canceled";

  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <SectionHeader title="Execução da viagem" description="Acompanhe a etapa operacional atual e a próxima movimentação permitida." actions={<TripStatusBadge status={summary.currentStatus} />} />
      <div className="mt-5 grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
        <div className="flex gap-3">
          <span className={`grid size-10 shrink-0 place-items-center rounded-xl ${terminal ? "bg-muted text-muted-foreground" : "bg-accent text-accent-foreground"}`}>
            {summary.currentStatus === "finished" ? <CheckCircle2 aria-hidden="true" className="size-5" /> : summary.currentStatus === "canceled" ? <CircleStop aria-hidden="true" className="size-5" /> : <Clock3 aria-hidden="true" className="size-5" />}
          </span>
          <div>
            <p className="font-semibold text-foreground">{statusDescription[summary.currentStatus]}</p>
            {summary.latestTransitionAt ? <p className="mt-1 text-sm text-muted-foreground">Última transição em {dateTime(summary.latestTransitionAt, timezone)}.</p> : <p className="mt-1 text-sm text-muted-foreground">Nenhuma transição operacional registrada.</p>}
          </div>
        </div>
        {summary.transitionLabel ? <p className="rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground"><span className="font-medium text-foreground">Próxima ação:</span> {summary.transitionLabel}</p> : null}
      </div>
      {summary.currentStatus === "finished" ? <div className="mt-5"><InlineAlert tone="success">Viagem concluída. Os dados permanecem disponíveis somente para consulta.</InlineAlert></div> : null}
      {summary.currentStatus === "canceled" ? <div className="mt-5"><InlineAlert tone="error">Viagem cancelada. O histórico operacional anterior foi preservado.</InlineAlert></div> : null}
    </section>
  );
}
