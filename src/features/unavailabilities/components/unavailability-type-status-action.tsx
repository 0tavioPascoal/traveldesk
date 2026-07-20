"use client";

import { useActionState, useState } from "react";

import { changeTechnicianUnavailabilityTypeStatusAction } from "@/features/unavailabilities/actions/change-technician-unavailability-type-status-action";
import { changeVehicleUnavailabilityTypeStatusAction } from "@/features/unavailabilities/actions/change-vehicle-unavailability-type-status-action";
import type { UnavailabilityResourceKind } from "@/features/unavailabilities/types/unavailability";

export function UnavailabilityTypeStatusAction({
  organizationSlug,
  resource,
  typeId,
  active,
}: {
  organizationSlug: string;
  resource: UnavailabilityResourceKind;
  typeId: string;
  active: boolean;
}) {
  const [confirming, setConfirming] = useState(false);
  const action = resource === "technicians"
    ? changeTechnicianUnavailabilityTypeStatusAction.bind(null, organizationSlug, typeId, !active)
    : changeVehicleUnavailabilityTypeStatusAction.bind(null, organizationSlug, typeId, !active);
  const [state, formAction, pending] = useActionState(action, { status: "idle", message: null } as const);
  if (active && !confirming) {
    return <button type="button" onClick={() => setConfirming(true)} className="text-sm font-medium text-red-700">Inativar</button>;
  }
  return (
    <form action={formAction} className="space-y-1">
      {active ? <p className="text-xs text-red-800">Confirmar inativação?</p> : null}
      <div className="flex gap-2">
        <button type="submit" disabled={pending} className={active ? "text-sm font-semibold text-red-700 disabled:opacity-60" : "text-sm font-semibold text-emerald-700 disabled:opacity-60"}>{pending ? "Salvando..." : active ? "Confirmar" : "Ativar"}</button>
        {active ? <button type="button" disabled={pending} onClick={() => setConfirming(false)} className="text-sm text-zinc-600">Cancelar</button> : null}
      </div>
      {state.message ? <p role={state.status === "error" ? "alert" : "status"} className="max-w-56 text-xs text-zinc-600">{state.message}</p> : null}
    </form>
  );
}
