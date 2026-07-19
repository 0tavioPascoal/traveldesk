"use client";

import { useActionState, useState } from "react";

import { changeServiceTypeStatusAction } from "@/features/service-types/actions/change-service-type-status-action";
import type { ServiceTypeStatusActionState } from "@/features/service-types/types/service-type";

type ServiceTypeStatusActionProps = {
  organizationSlug: string;
  serviceTypeId: string;
  active: boolean;
};

const initialState: ServiceTypeStatusActionState = {
  status: "idle",
  message: null,
};

export function ServiceTypeStatusAction({
  organizationSlug,
  serviceTypeId,
  active,
}: ServiceTypeStatusActionProps) {
  const [confirming, setConfirming] = useState(false);
  const action = changeServiceTypeStatusAction.bind(
    null,
    organizationSlug,
    serviceTypeId,
    !active,
  );
  const [state, formAction, pending] = useActionState(action, initialState);

  if (active && !confirming) {
    return (
      <div className="space-y-1">
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="text-sm font-medium text-red-700 hover:text-red-900"
        >
          Inativar
        </button>
        {state.message ? (
          <p role="status" className="max-w-52 text-xs text-zinc-600">
            {state.message}
          </p>
        ) : null}
      </div>
    );
  }

  if (active) {
    return (
      <form action={formAction} className="space-y-2 rounded-lg bg-red-50 p-2">
        <p className="text-xs text-red-900">Confirmar inativação?</p>
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={pending}
            className="text-xs font-semibold text-red-800 disabled:opacity-60"
          >
            {pending ? "Inativando..." : "Confirmar"}
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => setConfirming(false)}
            className="text-xs font-medium text-zinc-600 disabled:opacity-60"
          >
            Cancelar
          </button>
        </div>
        {state.message ? (
          <p role="alert" className="text-xs text-red-800">
            {state.message}
          </p>
        ) : null}
      </form>
    );
  }

  return (
    <form action={formAction} className="space-y-1">
      <button
        type="submit"
        disabled={pending}
        className="text-sm font-medium text-emerald-700 hover:text-emerald-900 disabled:opacity-60"
      >
        {pending ? "Ativando..." : "Ativar"}
      </button>
      {state.message ? (
        <p
          role={state.status === "error" ? "alert" : "status"}
          className="max-w-52 text-xs text-zinc-600"
        >
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
