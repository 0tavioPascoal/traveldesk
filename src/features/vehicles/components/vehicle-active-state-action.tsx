"use client";

import { useActionState, useEffect, useRef } from "react";

import { buttonStyles } from "@/components/ui/button";
import { InlineAlert } from "@/components/ui/inline-alert";
import { changeVehicleActiveStateAction } from "@/features/vehicles/actions/change-vehicle-active-state-action";

export function VehicleActiveStateAction({ organizationSlug, vehicleId, vehicleLabel, active, triggerClassName }: { organizationSlug: string; vehicleId: string; vehicleLabel?: string; active: boolean; triggerClassName?: string }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [state, action, pending] = useActionState(changeVehicleActiveStateAction.bind(null, organizationSlug, vehicleId, !active), { status: "idle", message: null });
  useEffect(() => { if (state.status === "success") dialogRef.current?.close(); }, [state.status]);
  const description = active
    ? "O veículo deixará de estar disponível para novas viagens. Reservas e dados históricos serão preservados."
    : "O veículo voltará a poder ser utilizado em novos planejamentos, respeitando sua condição operacional e indisponibilidades.";
  return <><button type="button" onClick={() => dialogRef.current?.showModal()} className={triggerClassName ?? buttonStyles({ variant: active ? "destructive" : "primary", size: "sm" })}>{active ? "Inativar" : "Reativar"}</button><dialog ref={dialogRef} aria-labelledby={`vehicle-active-title-${vehicleId}`} className="m-auto w-[min(30rem,calc(100%-2rem))] rounded-2xl border border-border bg-popover p-0 text-popover-foreground shadow-2xl"><form action={action} className="space-y-5 p-5 sm:p-6"><div><h2 id={`vehicle-active-title-${vehicleId}`} className="text-lg font-semibold">{active ? "Inativar veículo?" : "Reativar veículo?"}</h2>{vehicleLabel ? <p className="mt-1 font-mono text-sm font-medium">{vehicleLabel}</p> : null}<p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p></div>{state.status === "error" && state.message ? <InlineAlert tone="error">{state.message}</InlineAlert> : null}<div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><button type="button" disabled={pending} onClick={() => dialogRef.current?.close()} className={buttonStyles({ variant: "secondary" })}>Cancelar</button><button disabled={pending} className={buttonStyles({ variant: active ? "destructive" : "primary" })}>{pending ? "Aguarde..." : active ? "Confirmar inativação" : "Confirmar reativação"}</button></div></form></dialog></>;
}
