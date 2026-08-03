"use client";

import { useActionState, useEffect, useRef } from "react";

import { buttonStyles } from "@/components/ui/button";
import { InlineAlert } from "@/components/ui/inline-alert";
import { changeTechnicianUnavailabilityStatusAction } from "@/features/unavailabilities/actions/change-technician-unavailability-status-action";
import { changeVehicleUnavailabilityStatusAction } from "@/features/unavailabilities/actions/change-vehicle-unavailability-status-action";
import type { UnavailabilityQuickActionState, UnavailabilityResourceKind } from "@/features/unavailabilities/types/unavailability";

export function UnavailabilityStatusAction({ organizationSlug, resource, id, active, resourceName, triggerClassName }: { organizationSlug: string; resource: UnavailabilityResourceKind; id: string; active: boolean; resourceName: string; triggerClassName?: string }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const action = resource === "technicians"
    ? changeTechnicianUnavailabilityStatusAction.bind(null, organizationSlug, id, !active)
    : changeVehicleUnavailabilityStatusAction.bind(null, organizationSlug, id, !active);
  const [state, formAction, pending] = useActionState(action, { status: "idle", message: null } satisfies UnavailabilityQuickActionState);
  const title = active ? "Inativar indisponibilidade?" : "Reativar indisponibilidade?";
  const description = active
    ? "Este período deixará de bloquear novas alocações, mas permanecerá disponível no histórico."
    : "O recurso voltará a ser considerado indisponível durante o período registrado. As validações existentes serão aplicadas.";

  useEffect(() => {
    if (state.status === "success") dialogRef.current?.close();
  }, [state.status]);

  return <><button type="button" onClick={() => dialogRef.current?.showModal()} className={triggerClassName ?? buttonStyles({ variant: active ? "destructive" : "primary", size: "sm" })}>{active ? "Inativar" : "Reativar"}</button><dialog ref={dialogRef} aria-labelledby={`unavailability-status-${id}`} className="m-auto w-[min(30rem,calc(100%-2rem))] rounded-2xl border border-border bg-popover p-0 text-popover-foreground shadow-2xl" onClick={(event) => { if (event.target === dialogRef.current && !pending) dialogRef.current?.close(); }} onCancel={(event) => { if (pending) event.preventDefault(); }}><form action={formAction} className="space-y-5 p-5 sm:p-6"><div><h2 id={`unavailability-status-${id}`} className="text-lg font-semibold">{title}</h2><p className="mt-1 text-sm font-medium">{resourceName}</p><p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p></div>{state.message ? <InlineAlert tone={state.status === "error" ? "error" : "success"}>{state.message}</InlineAlert> : null}<div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><button type="button" disabled={pending} onClick={() => dialogRef.current?.close()} className={buttonStyles({ variant: "secondary" })}>Cancelar</button><button type="submit" disabled={pending} className={buttonStyles({ variant: active ? "destructive" : "primary" })}>{pending ? "Aguarde..." : active ? "Confirmar inativação" : "Confirmar reativação"}</button></div></form></dialog></>;
}
