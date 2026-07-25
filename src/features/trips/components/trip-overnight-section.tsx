"use client";

import { useActionState } from "react";

import { SectionHeader } from "@/components/page/section-header";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { InlineAlert } from "@/components/ui/inline-alert";
import {
  ensureTripOvernightAction,
  resetTripOvernightAction,
  reviewTripOvernightAction,
} from "@/features/trips/actions/trip-overnight-actions";
import { TripOvernightAdjustDialog } from "@/features/trips/components/trip-overnight-adjust-dialog";
import type { TripOvernightActionState, TripOvernightSummary } from "@/features/trips/types/trip-overnight";
import type { TripStatus } from "@/features/trips/types/trip";

const initialState = { status: "idle", message: null } satisfies TripOvernightActionState;

function status(summary: TripOvernightSummary) {
  if (!summary.periodValid) return { label: "Sem período", tone: "neutral" } as const;
  if (summary.isOutdated) return { label: "Desatualizado", tone: "warning" } as const;
  if (summary.isAdjusted) return { label: "Ajustado", tone: "info" } as const;
  if (summary.isReviewed) return { label: "Revisado", tone: "success" } as const;
  return { label: "Pendente", tone: "warning" } as const;
}

function formatDate(value: string | null, timezone: string) {
  if (!value) return "Não registrada";
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short", timeZone: timezone }).format(new Date(value));
}

function ActionMessage({ state }: { state: TripOvernightActionState }) {
  if (!state.message) return null;
  return <InlineAlert tone={state.status === "error" ? "error" : "success"}>{state.message}</InlineAlert>;
}

export function TripOvernightSection({
  organizationSlug,
  tripId,
  tripStatus,
  summary,
  timezone,
}: {
  organizationSlug: string;
  tripId: string;
  tripStatus: TripStatus;
  summary: TripOvernightSummary;
  timezone: string;
}) {
  const revision = summary.revision ?? 0;
  const [reviewState, reviewAction, reviewPending] = useActionState(
    reviewTripOvernightAction.bind(null, organizationSlug, tripId, revision), initialState,
  );
  const [resetState, resetAction, resetPending] = useActionState(
    resetTripOvernightAction.bind(null, organizationSlug, tripId, revision), initialState,
  );
  const [ensureState, ensureAction, ensurePending] = useActionState(
    ensureTripOvernightAction.bind(null, organizationSlug, tripId), initialState,
  );
  const badge = status(summary);
  const editable = tripStatus === "draft" || tripStatus === "planned";
  const pending = reviewPending || resetPending || ensurePending;

  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <SectionHeader title="Pernoites" description="Estimativa pela diferença entre as datas locais de saída e retorno." actions={<Badge tone={badge.tone}>{badge.label}</Badge>} />

      {!summary.periodValid ? (
        <div className="mt-5"><InlineAlert tone="warning">Defina um período válido para calcular os pernoites.</InlineAlert></div>
      ) : summary.isOutdated ? (
        <div className="mt-5 space-y-3 rounded-lg border border-warning/30 bg-warning/10 p-4 text-sm text-warning">
          <p>O período ou o timezone da viagem foi alterado. Atualize e revise novamente os pernoites.</p>
          {editable ? <form action={ensureAction}><button type="submit" disabled={pending} className="font-semibold underline disabled:opacity-50">{ensurePending ? "Atualizando..." : "Atualizar cálculo"}</button></form> : null}
        </div>
      ) : (
        <>
          <dl className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl bg-surface-muted p-4"><dt className="text-xs font-medium uppercase text-subtle-foreground">Automático</dt><dd className="mt-1 text-2xl font-bold">{summary.calculatedOvernights}</dd></div>
            <div className="rounded-xl bg-primary p-4 text-primary-foreground"><dt className="text-xs font-medium uppercase opacity-75">Efetivo</dt><dd className="mt-1 text-2xl font-bold">{summary.effectiveOvernights}</dd></div>
            <div className="rounded-xl bg-surface-muted p-4"><dt className="text-xs font-medium uppercase text-subtle-foreground">Técnicos</dt><dd className="mt-1 text-2xl font-bold">{summary.technicianCount}</dd></div>
            <div className="rounded-xl bg-surface-muted p-4"><dt className="text-xs font-medium uppercase text-subtle-foreground">Pernoites-pessoa</dt><dd className="mt-1 text-2xl font-bold">{summary.estimatedPersonOvernights}</dd></div>
          </dl>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <div><dt className="text-subtle-foreground">Timezone do cálculo</dt><dd className="font-medium">{summary.calculationTimezone}</dd></div>
            <div><dt className="text-subtle-foreground">Última revisão</dt><dd className="font-medium">{formatDate(summary.reviewedAt, timezone)}</dd></div>
          </dl>
          {summary.isAdjusted ? (
            <div className="mt-4 rounded-lg border border-info/30 bg-info/10 p-4 text-sm text-foreground">
              <p><strong>Cálculo automático:</strong> {summary.calculatedOvernights} · <strong>Valor ajustado:</strong> {summary.adjustedOvernights}</p>
              <p className="mt-1"><strong>Justificativa:</strong> {summary.adjustmentReason}</p>
              <p className="mt-1 text-xs text-muted-foreground">Ajustado em {formatDate(summary.adjustedAt, timezone)}.</p>
            </div>
          ) : !summary.isReviewed ? (
            <div className="mt-4"><InlineAlert tone="warning">O sistema calculou {summary.calculatedOvernights} pernoite(s). Revise o valor antes de confirmar a viagem.</InlineAlert></div>
          ) : (
            <div className="mt-4"><InlineAlert tone="success">{summary.effectiveOvernights} pernoite(s) revisado(s).</InlineAlert></div>
          )}
        </>
      )}

      {!editable ? <p className="mt-4 rounded-lg bg-surface-muted p-3 text-sm text-muted-foreground">Os pernoites permanecem somente para consulta após a confirmação ou encerramento da viagem.</p> : null}

      {editable && summary.periodValid && !summary.isOutdated && summary.revision !== null && summary.effectiveOvernights !== null ? (
        <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-border pt-5">
          {!summary.isReviewed ? <form action={reviewAction}><button type="submit" disabled={pending} className={buttonStyles()}>{reviewPending ? "Revisando..." : "Revisar cálculo"}</button></form> : null}
          <TripOvernightAdjustDialog organizationSlug={organizationSlug} tripId={tripId} revision={summary.revision} effectiveOvernights={summary.effectiveOvernights} />
          {summary.isAdjusted ? (
            <form action={resetAction} onSubmit={(event) => { if (!window.confirm("Remover o ajuste e voltar ao cálculo automático?")) event.preventDefault(); }}>
              <button type="submit" disabled={pending} className={buttonStyles({ variant: "secondary" })}>{resetPending ? "Restaurando..." : "Usar cálculo automático"}</button>
            </form>
          ) : null}
        </div>
      ) : null}
      <div className="mt-3 space-y-1"><ActionMessage state={reviewState} /><ActionMessage state={resetState} /><ActionMessage state={ensureState} /></div>
    </section>
  );
}
