"use client";

import { useActionState, useEffect, useRef } from "react";

import { buttonStyles } from "@/components/ui/button";
import { InlineAlert } from "@/components/ui/inline-alert";
import { changeTechnicianStatusAction } from "@/features/technicians/actions/change-technician-status-action";

export function TechnicianStatusAction({
  organizationSlug,
  technicianId,
  technicianName,
  active,
  triggerClassName,
}: {
  organizationSlug: string;
  technicianId: string;
  technicianName?: string;
  active: boolean;
  triggerClassName?: string;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [state, action, pending] = useActionState(
    changeTechnicianStatusAction.bind(null, organizationSlug, technicianId, !active),
    { status: "idle", message: null },
  );

  useEffect(() => {
    if (state.status === "success") dialogRef.current?.close();
  }, [state.status]);

  const title = active ? "Inativar técnico?" : "Reativar técnico?";
  const description = active
    ? "O técnico deixará de estar disponível para novas viagens. Os vínculos e dados históricos serão preservados."
    : "O técnico voltará a estar disponível para novos planejamentos, respeitando suas indisponibilidades e especialidades.";

  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        className={triggerClassName ?? buttonStyles({ variant: active ? "destructive" : "secondary", size: "sm" })}
      >
        {active ? "Inativar" : "Reativar"}
      </button>
      <dialog
        ref={dialogRef}
        aria-labelledby={`technician-status-title-${technicianId}`}
        className="m-auto w-[min(30rem,calc(100%-2rem))] rounded-2xl border border-border bg-popover p-0 text-popover-foreground shadow-2xl"
      >
        <form action={action} className="space-y-5 p-5 sm:p-6">
          <div>
            <h2 id={`technician-status-title-${technicianId}`} className="text-lg font-semibold">{title}</h2>
            {technicianName ? <p className="mt-1 text-sm font-medium text-foreground">{technicianName}</p> : null}
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
          </div>
          {state.status === "error" && state.message ? <InlineAlert tone="error">{state.message}</InlineAlert> : null}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button type="button" disabled={pending} onClick={() => dialogRef.current?.close()} className={buttonStyles({ variant: "secondary" })}>Cancelar</button>
            <button type="submit" disabled={pending} className={buttonStyles({ variant: active ? "destructive" : "primary" })}>
              {pending ? "Aguarde..." : active ? "Confirmar inativação" : "Confirmar reativação"}
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}
