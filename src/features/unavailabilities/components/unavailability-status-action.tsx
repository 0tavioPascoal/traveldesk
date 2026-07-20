"use client";

import { useActionState, useState } from "react";

import { changeTechnicianUnavailabilityStatusAction } from "@/features/unavailabilities/actions/change-technician-unavailability-status-action";
import { changeVehicleUnavailabilityStatusAction } from "@/features/unavailabilities/actions/change-vehicle-unavailability-status-action";
import type { UnavailabilityQuickActionState, UnavailabilityResourceKind } from "@/features/unavailabilities/types/unavailability";

export function UnavailabilityStatusAction({
  organizationSlug,
  resource,
  id,
  active,
}: {
  organizationSlug: string;
  resource: UnavailabilityResourceKind;
  id: string;
  active: boolean;
}) {
  const [confirming, setConfirming] = useState(false);
  const action = resource === "technicians"
    ? changeTechnicianUnavailabilityStatusAction.bind(null, organizationSlug, id, !active)
    : changeVehicleUnavailabilityStatusAction.bind(null, organizationSlug, id, !active);
  const [state, formAction, pending] = useActionState(action, {
    status: "idle", message: null,
  } satisfies UnavailabilityQuickActionState);
  if (active && !confirming) return <button type="button" onClick={() => setConfirming(true)} className="text-sm font-medium text-red-700">Inativar</button>;
  return (
    <form action={formAction} className="space-y-1">
      {active ? <p className="text-xs text-red-800">Este período deixará de bloquear o recurso. Confirmar?</p> : null}
      <div className="flex gap-2"><button type="submit" disabled={pending} className={active ? "text-sm font-semibold text-red-700 disabled:opacity-60" : "text-sm font-semibold text-emerald-700 disabled:opacity-60"}>{pending ? "Salvando..." : active ? "Confirmar" : "Reativar"}</button>{active ? <button type="button" disabled={pending} onClick={() => setConfirming(false)} className="text-sm text-zinc-600">Cancelar</button> : null}</div>
      {state.message ? <p role={state.status === "error" ? "alert" : "status"} className="max-w-72 text-xs text-zinc-600">{state.message}</p> : null}
    </form>
  );
}
