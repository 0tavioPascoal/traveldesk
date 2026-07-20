"use client";

import { useActionState, useState } from "react";
import { changeTechnicianStatusAction } from "@/features/technicians/actions/change-technician-status-action";

export function TechnicianStatusAction({ organizationSlug, technicianId, active }: { organizationSlug: string; technicianId: string; active: boolean }) {
  const [confirming, setConfirming] = useState(false);
  const [state, action, pending] = useActionState(changeTechnicianStatusAction.bind(null, organizationSlug, technicianId, !active), { status: "idle", message: null });
  if (!active || confirming) return <form action={action} className="space-y-2"><div className="flex gap-2">{active && <button type="button" onClick={() => setConfirming(false)} className="text-sm text-zinc-600">Cancelar</button>}<button type="submit" disabled={pending} className={`text-sm font-medium ${active ? "text-red-700" : "text-emerald-700"}`}>{pending ? "Aguarde..." : active ? "Confirmar inativação" : "Ativar"}</button></div>{state.message ? <p className={`text-xs ${state.status === "error" ? "text-red-700" : "text-emerald-700"}`}>{state.message}</p> : null}</form>;
  return <button type="button" onClick={() => setConfirming(true)} className="text-sm font-medium text-red-700">Inativar</button>;
}
