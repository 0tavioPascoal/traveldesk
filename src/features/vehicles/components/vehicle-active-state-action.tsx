"use client";

import { useActionState, useState } from "react";

import { changeVehicleActiveStateAction } from "@/features/vehicles/actions/change-vehicle-active-state-action";

export function VehicleActiveStateAction({ organizationSlug, vehicleId, active }: { organizationSlug: string; vehicleId: string; active: boolean }) {
  const [confirming, setConfirming] = useState(false);
  const [state, action, pending] = useActionState(changeVehicleActiveStateAction.bind(null, organizationSlug, vehicleId, !active), { status: "idle", message: null });
  if (!active || confirming) return <form action={action} className="space-y-2"><div className="flex flex-wrap gap-2">{active ? <button type="button" onClick={() => setConfirming(false)} className="text-sm text-zinc-600">Cancelar</button> : null}<button disabled={pending} className={`text-sm font-medium ${active ? "text-red-700" : "text-emerald-700"}`}>{pending ? "Aguarde..." : active ? "Confirmar inativação" : "Ativar"}</button></div>{state.message ? <p className={`text-xs ${state.status === "error" ? "text-red-700" : "text-emerald-700"}`}>{state.message}</p> : null}</form>;
  return <button type="button" onClick={() => setConfirming(true)} className="text-sm font-medium text-red-700">Inativar</button>;
}
