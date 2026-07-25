"use client";

import { useActionState, useEffect, useRef } from "react";
import { ArrowRight, CheckCircle2, Pencil } from "lucide-react";
import Link from "next/link";

import { buttonStyles } from "@/components/ui/button";
import { InlineAlert } from "@/components/ui/inline-alert";
import { confirmTripAction } from "@/features/trips/actions/confirm-trip-action";
import { transitionTripStatusAction } from "@/features/trips/actions/transition-trip-status-action";
import type { TripConfirmationActionState, TripConfirmationReadiness } from "@/features/trips/types/trip-confirmation";
import type { TripExecutionActionState, TripExecutionSummary, TripOperationalStatus } from "@/features/trips/types/trip-execution";
import type { TripStatus } from "@/features/trips/types/trip";

const confirmationInitial = { status: "idle", message: null } satisfies TripConfirmationActionState;
const transitionInitial = { status: "idle", message: null } satisfies TripExecutionActionState;

const transitionQuestion: Record<TripOperationalStatus, string> = {
  traveling: "Deseja registrar o início do deslocamento?",
  at_client: "Deseja registrar a chegada ao cliente?",
  in_service: "Deseja registrar o início do atendimento?",
  returning: "Deseja registrar o início do retorno?",
  finished: "Deseja finalizar a viagem?",
};

export function TripPrimaryAction({
  organizationSlug,
  tripId,
  status,
  readiness,
  execution,
}: {
  organizationSlug: string;
  tripId: string;
  status: TripStatus;
  readiness: TripConfirmationReadiness | null;
  execution: TripExecutionSummary;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [confirmationState, confirmationAction, confirmationPending] = useActionState(
    confirmTripAction.bind(null, organizationSlug, tripId),
    confirmationInitial,
  );
  const [transitionState, transitionAction, transitionPending] = useActionState(
    transitionTripStatusAction.bind(null, organizationSlug, tripId, execution.nextStatus ?? ""),
    transitionInitial,
  );

  useEffect(() => {
    if (confirmationState.status === "success" || transitionState.status === "success") {
      dialogRef.current?.close();
    }
  }, [confirmationState.status, transitionState.status]);

  if (status === "draft") {
    return (
      <Link href={`/app/${organizationSlug}/planejamento/viagens/${tripId}/editar`} className={`${buttonStyles()} w-full sm:w-auto`}>
        <Pencil aria-hidden="true" className="size-4" />
        Editar viagem
      </Link>
    );
  }

  const isConfirmation = status === "planned";
  const canTransition = execution.canTransition && execution.nextStatus && execution.transitionLabel;
  if (!isConfirmation && !canTransition) return null;

  const pending = isConfirmation ? confirmationPending : transitionPending;
  const state = isConfirmation ? confirmationState : transitionState;

  return (
    <>
      <button
        type="button"
        disabled={isConfirmation && !readiness?.ready}
        title={isConfirmation && !readiness?.ready ? "Resolva as pendências de confirmação antes de continuar." : undefined}
        onClick={() => dialogRef.current?.showModal()}
        className={`${buttonStyles()} w-full sm:w-auto`}
      >
        {isConfirmation ? <CheckCircle2 aria-hidden="true" className="size-4" /> : <ArrowRight aria-hidden="true" className="size-4" />}
        {isConfirmation ? "Confirmar viagem" : execution.transitionLabel}
      </button>

      <dialog ref={dialogRef} aria-labelledby="trip-primary-action-title" className="m-auto w-[min(36rem,calc(100%-2rem))] rounded-2xl border border-border bg-popover p-0 text-popover-foreground shadow-2xl">
        <form action={isConfirmation ? confirmationAction : transitionAction} className="space-y-5 p-5 sm:p-6">
          <div>
            <h2 id="trip-primary-action-title" className="text-lg font-semibold">{isConfirmation ? "Confirmar viagem" : "Registrar etapa"}</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {isConfirmation
                ? "Ao confirmar, a viagem passará a representar uma programação operacional. Equipe, transporte e pernoites não poderão ser alterados livremente."
                : execution.nextStatus ? transitionQuestion[execution.nextStatus] : "Confirme a próxima etapa da viagem."}
            </p>
          </div>
          {!isConfirmation ? (
            <div>
              <label htmlFor="primary-transition-note" className="text-sm font-medium">Observação operacional (opcional)</label>
              <textarea
                id="primary-transition-note"
                name="note"
                rows={4}
                maxLength={1000}
                disabled={pending}
                className="mt-1 w-full rounded-lg border border-input bg-card px-3 py-2 text-sm text-card-foreground"
                placeholder="Registre atrasos ou informações relevantes."
              />
            </div>
          ) : null}
          {state.status === "error" && state.message ? <InlineAlert tone="error">{state.message}</InlineAlert> : null}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button type="button" disabled={pending} onClick={() => dialogRef.current?.close()} className={buttonStyles({ variant: "secondary" })}>Voltar</button>
            <button type="submit" disabled={pending} className={buttonStyles()}>
              {pending ? "Registrando..." : isConfirmation ? "Confirmar viagem" : "Confirmar etapa"}
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}
