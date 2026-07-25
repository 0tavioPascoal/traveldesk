"use client";

import { useActionState, useState } from "react";

import { buttonStyles } from "@/components/ui/button";
import { InlineAlert } from "@/components/ui/inline-alert";
import { cancelTripAction } from "@/features/trips/actions/cancel-trip-action";
import type { TripQuickActionState } from "@/features/trips/types/trip";

export function TripCancelAction({ organizationSlug, tripId }: { organizationSlug: string; tripId: string }) {
  const [confirming, setConfirming] = useState(false);
  const [state, action, pending] = useActionState(cancelTripAction.bind(null, organizationSlug, tripId), { status: "idle", message: null } satisfies TripQuickActionState);
  if (!confirming) return <button type="button" onClick={() => setConfirming(true)} className={buttonStyles({ variant: "destructive" })}>Cancelar viagem</button>;
  return <form action={action} className="w-full space-y-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4"><label htmlFor={`cancellation-${tripId}`} className="block text-sm font-semibold text-foreground">Motivo do cancelamento</label><textarea id={`cancellation-${tripId}`} name="cancellationReason" required minLength={5} maxLength={500} rows={3} disabled={pending} className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm text-card-foreground" /><p className="text-xs text-muted-foreground">A viagem será preservada no histórico.</p><div className="flex flex-col-reverse gap-3 sm:flex-row"><button type="button" disabled={pending} onClick={() => setConfirming(false)} className={buttonStyles({ variant: "secondary" })}>Voltar</button><button type="submit" disabled={pending} className={buttonStyles({ variant: "destructive" })}>{pending ? "Cancelando..." : "Confirmar cancelamento"}</button></div>{state.message ? <InlineAlert tone={state.status === "error" ? "error" : "success"}>{state.message}</InlineAlert> : null}</form>;
}
