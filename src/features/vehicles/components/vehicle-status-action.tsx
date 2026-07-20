"use client";

import { useActionState, useState } from "react";

import { changeVehicleStatusAction } from "@/features/vehicles/actions/change-vehicle-status-action";
import type { VehicleOperationalStatus } from "@/features/vehicles/types/vehicle";

export function VehicleStatusAction({ organizationSlug, vehicleId, currentStatus }: { organizationSlug: string; vehicleId: string; currentStatus: VehicleOperationalStatus }) {
  const [selected, setSelected] = useState<VehicleOperationalStatus>(currentStatus);
  const [confirming, setConfirming] = useState(false);
  const [state, action, pending] = useActionState(changeVehicleStatusAction.bind(null, organizationSlug, vehicleId, selected), { status: "idle", message: null });
  const needsConfirmation = selected !== "available" && selected !== currentStatus;
  return <form action={action} className="space-y-2"><div className="flex flex-wrap gap-2"><select value={selected} disabled={pending} onChange={(event) => { setSelected(event.target.value as VehicleOperationalStatus); setConfirming(false); }} className="h-9 rounded-lg border border-zinc-300 bg-white px-2 text-sm"><option value="available">Disponível</option><option value="maintenance">Em manutenção</option><option value="blocked">Bloqueado</option></select>{needsConfirmation && !confirming ? <button type="button" onClick={() => setConfirming(true)} className="text-sm font-medium text-amber-700">Alterar</button> : <button type="submit" disabled={pending || selected === currentStatus} className="text-sm font-medium text-zinc-900 disabled:opacity-40">{pending ? "Salvando..." : needsConfirmation ? "Confirmar" : "Salvar"}</button>}{confirming ? <button type="button" onClick={() => setConfirming(false)} className="text-sm text-zinc-600">Cancelar</button> : null}</div>{state.message ? <p className={`text-xs ${state.status === "error" ? "text-red-700" : "text-emerald-700"}`}>{state.message}</p> : null}</form>;
}
