"use client";

import { Power, PowerOff, X } from "lucide-react";
import { useActionState, useRef } from "react";

import { Button, buttonStyles } from "@/components/ui/button";
import { InlineAlert } from "@/components/ui/inline-alert";
import { changeClientStatusAction } from "@/features/clients/actions/change-client-status-action";
import type { ClientStatusActionState } from "@/features/clients/types/client";

type ClientStatusActionProps = {
  organizationSlug: string;
  clientId: string;
  active: boolean;
};

const initialState: ClientStatusActionState = { status: "idle", message: null };

export function ClientStatusAction({ organizationSlug, clientId, active }: ClientStatusActionProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const action = changeClientStatusAction.bind(null, organizationSlug, clientId, !active);
  const [state, formAction, pending] = useActionState(action, initialState);
  const title = active ? "Inativar cliente?" : "Ativar cliente?";

  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        className={`min-h-10 px-2 ${active ? "text-destructive" : "text-success"} rounded-lg text-sm font-semibold hover:bg-muted`}
      >
        {active ? "Inativar" : "Ativar"}
      </button>
      <dialog
        ref={dialogRef}
        aria-labelledby={`client-status-title-${clientId}`}
        className="m-auto w-[min(30rem,calc(100%-2rem))] rounded-2xl border border-border bg-popover p-0 text-popover-foreground shadow-2xl"
        onClick={(event) => { if (event.target === dialogRef.current) dialogRef.current?.close(); }}
      >
        <div className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className={`mb-3 grid size-10 place-items-center rounded-full ${active ? "bg-destructive/10 text-destructive" : "bg-success/10 text-success"}`}>
                {active ? <PowerOff aria-hidden="true" className="size-5" /> : <Power aria-hidden="true" className="size-5" />}
              </div>
              <h2 id={`client-status-title-${clientId}`} className="text-lg font-semibold">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {active
                  ? "O cliente deixará de estar disponível para novos planejamentos. Para preservar a consistência, todas as unidades precisam estar inativas."
                  : "O cliente voltará a ficar disponível para novos cadastros e planejamentos."}
              </p>
            </div>
            <button type="button" onClick={() => dialogRef.current?.close()} aria-label="Fechar confirmação" className="grid size-10 shrink-0 place-items-center rounded-lg text-muted-foreground hover:bg-muted"><X aria-hidden="true" className="size-5" /></button>
          </div>
          {state.message ? <div className="mt-4"><InlineAlert tone={state.status === "error" ? "error" : "success"}>{state.message}</InlineAlert></div> : null}
          <form action={formAction} className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="secondary" disabled={pending} onClick={() => dialogRef.current?.close()}>Cancelar</Button>
            <button type="submit" disabled={pending} className={buttonStyles({ variant: active ? "destructive" : "primary" })}>
              {pending ? (active ? "Inativando..." : "Ativando...") : title.replace("?", "")}
            </button>
          </form>
        </div>
      </dialog>
    </>
  );
}
