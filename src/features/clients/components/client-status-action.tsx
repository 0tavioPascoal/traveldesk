"use client";

import { useActionState, useState } from "react";

import { changeClientStatusAction } from "@/features/clients/actions/change-client-status-action";
import type { ClientStatusActionState } from "@/features/clients/types/client";

type ClientStatusActionProps = {
  organizationSlug: string;
  clientId: string;
  active: boolean;
};

const initialState: ClientStatusActionState = { status: "idle", message: null };

export function ClientStatusAction({ organizationSlug, clientId, active }: ClientStatusActionProps) {
  const [confirming, setConfirming] = useState(false);
  const action = changeClientStatusAction.bind(null, organizationSlug, clientId, !active);
  const [state, formAction, pending] = useActionState(action, initialState);

  if (active && !confirming) {
    return (
      <div className="space-y-1">
        <button type="button" onClick={() => setConfirming(true)} className="text-sm font-medium text-red-700 hover:text-red-900">Inativar</button>
        {state.message ? <p role={state.status === "error" ? "alert" : "status"} className="max-w-64 text-xs text-zinc-600">{state.message}</p> : null}
      </div>
    );
  }

  if (active) {
    return (
      <form action={formAction} className="space-y-2 rounded-lg bg-red-50 p-2">
        <p className="max-w-64 text-xs text-red-900">O cliente só será inativado se não possuir unidades ativas. Confirmar?</p>
        <div className="flex gap-2">
          <button type="submit" disabled={pending} className="text-xs font-semibold text-red-800 disabled:opacity-60">{pending ? "Inativando..." : "Confirmar"}</button>
          <button type="button" disabled={pending} onClick={() => setConfirming(false)} className="text-xs font-medium text-zinc-600 disabled:opacity-60">Cancelar</button>
        </div>
        {state.message ? <p role="alert" className="max-w-64 text-xs text-red-800">{state.message}</p> : null}
      </form>
    );
  }

  return (
    <form action={formAction} className="space-y-1">
      <button type="submit" disabled={pending} className="text-sm font-medium text-emerald-700 hover:text-emerald-900 disabled:opacity-60">{pending ? "Ativando..." : "Ativar"}</button>
      {state.message ? <p role={state.status === "error" ? "alert" : "status"} className="max-w-64 text-xs text-zinc-600">{state.message}</p> : null}
    </form>
  );
}
