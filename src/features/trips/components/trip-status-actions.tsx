"use client";

import { useActionState } from "react";

import { buttonStyles } from "@/components/ui/button";
import { InlineAlert } from "@/components/ui/inline-alert";
import { markTripAsPlannedAction } from "@/features/trips/actions/mark-trip-as-planned-action";
import { restoreCanceledTripAction } from "@/features/trips/actions/restore-canceled-trip-action";
import { returnTripToDraftAction } from "@/features/trips/actions/return-trip-to-draft-action";
import { TripCancelAction } from "@/features/trips/components/trip-cancel-action";
import type { TripQuickActionState, TripStatus } from "@/features/trips/types/trip";

const initial = { status: "idle", message: null } satisfies TripQuickActionState;

export function TripStatusActions({ organizationSlug, tripId, status, role, confirmedAt }: { organizationSlug: string; tripId: string; status: TripStatus; role: "admin" | "coordinator"; confirmedAt: string | null }) {
  const [planState, planAction, planPending] = useActionState(markTripAsPlannedAction.bind(null, organizationSlug, tripId), initial);
  const [draftState, draftAction, draftPending] = useActionState(returnTripToDraftAction.bind(null, organizationSlug, tripId), initial);
  const [restoreState, restoreAction, restorePending] = useActionState(restoreCanceledTripAction.bind(null, organizationSlug, tripId), initial);
  const state = status === "draft" ? planState : status === "planned" ? draftState : restoreState;
  const cancelable = ["draft", "planned", "confirmed", "traveling", "at_client", "in_service", "returning"].includes(status);
  const hasAction = status === "draft" || status === "planned" || cancelable || (status === "canceled" && role === "admin" && !confirmedAt);
  if (!hasAction) return <p className="text-sm text-muted-foreground">Nenhuma outra ação está disponível para este status.</p>;
  return <div className="space-y-3"><div className="flex flex-wrap items-start gap-3">{status === "draft" ? <form action={planAction}><button disabled={planPending} className={buttonStyles()}>{planPending ? "Planejando..." : "Marcar como planejada"}</button></form> : null}{status === "planned" ? <form action={draftAction}><button disabled={draftPending} className={buttonStyles({ variant: "secondary" })}>{draftPending ? "Salvando..." : "Retornar para rascunho"}</button></form> : null}{cancelable ? <TripCancelAction organizationSlug={organizationSlug} tripId={tripId} /> : null}{status === "canceled" && role === "admin" && !confirmedAt ? <form action={restoreAction}><button disabled={restorePending} className={buttonStyles()}>{restorePending ? "Restaurando..." : "Restaurar como rascunho"}</button></form> : null}</div>{state.message ? <InlineAlert tone={state.status === "error" ? "error" : "success"}>{state.message}</InlineAlert> : null}</div>;
}
