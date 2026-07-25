"use client";

import { useActionState, useEffect, useRef } from "react";

import { buttonStyles } from "@/components/ui/button";
import { InlineAlert } from "@/components/ui/inline-alert";
import { adjustTripOvernightAction } from "@/features/trips/actions/trip-overnight-actions";
import type { TripOvernightActionState } from "@/features/trips/types/trip-overnight";

const initialState = { status: "idle", message: null } satisfies TripOvernightActionState;

export function TripOvernightAdjustDialog({
  organizationSlug,
  tripId,
  revision,
  effectiveOvernights,
}: {
  organizationSlug: string;
  tripId: string;
  revision: number;
  effectiveOvernights: number;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [state, action, pending] = useActionState(
    adjustTripOvernightAction.bind(null, organizationSlug, tripId, revision),
    initialState,
  );

  useEffect(() => {
    if (state.status === "success") dialogRef.current?.close();
  }, [state.status]);

  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        className={buttonStyles({ variant: "secondary", size: "sm" })}
      >
        Ajustar quantidade
      </button>
      <dialog
        ref={dialogRef}
        aria-labelledby="overnight-adjust-title"
        className="m-auto w-[calc(100%-2rem)] max-w-lg rounded-2xl border border-border bg-popover p-0 text-popover-foreground shadow-xl"
      >
        <form action={action} className="space-y-5 p-6">
          <div>
            <h3 id="overnight-adjust-title" className="text-lg font-semibold">Ajustar pernoites</h3>
            <p className="mt-1 text-sm text-muted-foreground">Registre o valor operacional e explique por que o cálculo automático deve ser substituído.</p>
          </div>
          <label className="block text-sm font-medium">
            Quantidade de pernoites
            <input
              name="adjustedOvernights"
              type="number"
              min={0}
              max={3650}
              step={1}
              required
              disabled={pending}
              defaultValue={state.values?.adjustedOvernights ?? effectiveOvernights}
              className="mt-1 h-11 w-full rounded-lg border border-input bg-card px-3"
            />
            {state.fieldErrors?.adjustedOvernights?.map((error) => <span key={error} className="mt-1 block text-xs text-destructive">{error}</span>)}
          </label>
          <label className="block text-sm font-medium">
            Justificativa
            <textarea
              name="adjustmentReason"
              minLength={5}
              maxLength={1000}
              required
              disabled={pending}
              defaultValue={state.values?.adjustmentReason ?? ""}
              className="mt-1 min-h-28 w-full rounded-lg border border-input bg-card px-3 py-2"
            />
            {state.fieldErrors?.adjustmentReason?.map((error) => <span key={error} className="mt-1 block text-xs text-destructive">{error}</span>)}
          </label>
          {state.status === "error" && state.message ? <InlineAlert tone="error">{state.message}</InlineAlert> : null}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button type="button" disabled={pending} onClick={() => dialogRef.current?.close()} className={buttonStyles({ variant: "secondary" })}>Cancelar</button>
            <button type="submit" disabled={pending} className={buttonStyles()}>{pending ? "Salvando..." : "Salvar ajuste"}</button>
          </div>
        </form>
      </dialog>
    </>
  );
}
