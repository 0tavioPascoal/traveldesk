"use client";

import { useActionState, useEffect, useRef, useState } from "react";

import { buttonStyles } from "@/components/ui/button";
import { InlineAlert } from "@/components/ui/inline-alert";
import { changeVehicleStatusAction } from "@/features/vehicles/actions/change-vehicle-status-action";
import { vehicleOperationalLabel } from "@/features/vehicles/application/vehicle-presentation";
import type { VehicleOperationalStatus } from "@/features/vehicles/types/vehicle";

export function VehicleStatusAction({ organizationSlug, vehicleId, currentStatus, vehicleLabel, disabled = false, triggerClassName }: { organizationSlug: string; vehicleId: string; currentStatus: VehicleOperationalStatus; vehicleLabel?: string; disabled?: boolean; triggerClassName?: string }) {
  const [selected, setSelected] = useState<VehicleOperationalStatus>(currentStatus);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [state, action, pending] = useActionState(changeVehicleStatusAction.bind(null, organizationSlug, vehicleId, selected), { status: "idle", message: null });
  useEffect(() => { if (state.status === "success") dialogRef.current?.close(); }, [state.status]);
  return <><button type="button" disabled={disabled} onClick={() => dialogRef.current?.showModal()} className={triggerClassName ?? buttonStyles({ variant: "secondary", size: "sm" })}>Alterar condição</button><dialog ref={dialogRef} aria-labelledby={`vehicle-status-title-${vehicleId}`} className="m-auto w-[min(30rem,calc(100%-2rem))] rounded-2xl border border-border bg-popover p-0 text-popover-foreground shadow-2xl"><form action={action} className="space-y-5 p-5 sm:p-6"><div><h2 id={`vehicle-status-title-${vehicleId}`} className="text-lg font-semibold">Alterar condição operacional</h2>{vehicleLabel ? <p className="mt-1 font-mono text-sm font-medium">{vehicleLabel}</p> : null}<p className="mt-2 text-sm text-muted-foreground">Condição atual: <strong>{vehicleOperationalLabel(currentStatus)}</strong>.</p></div><div className="space-y-1.5"><label htmlFor={`operational-status-${vehicleId}`} className="text-sm font-medium">Nova condição</label><select id={`operational-status-${vehicleId}`} value={selected} disabled={pending} onChange={(event) => setSelected(event.target.value as VehicleOperationalStatus)} className="h-11 w-full rounded-lg border border-input bg-card px-3 text-sm"><option value="available">Disponível</option><option value="maintenance">Em manutenção</option><option value="blocked">Bloqueado</option></select></div><p className="text-xs leading-5 text-muted-foreground">A condição operacional informa se o veículo está apto para viagens e não altera sua situação cadastral.</p>{state.status === "error" && state.message ? <InlineAlert tone="error">{state.message}</InlineAlert> : null}<div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><button type="button" disabled={pending} onClick={() => dialogRef.current?.close()} className={buttonStyles({ variant: "secondary" })}>Cancelar</button><button disabled={pending || selected === currentStatus} className={buttonStyles()}>{pending ? "Salvando..." : "Confirmar alteração"}</button></div></form></dialog></>;
}
