"use client";

import { Power, PowerOff, X } from "lucide-react";
import { useActionState, useEffect, useRef } from "react";

import { Button, buttonStyles } from "@/components/ui/button";
import { InlineAlert } from "@/components/ui/inline-alert";
import { changeClientUnitStatusAction } from "@/features/clients/actions/change-client-unit-status-action";
import type { ClientStatusActionState } from "@/features/clients/types/client";

type ClientUnitStatusActionProps = {
  organizationSlug: string;
  clientId: string;
  unitId: string;
  active: boolean;
};

const initialState: ClientStatusActionState = { status: "idle", message: null };

export function ClientUnitStatusAction({ organizationSlug, clientId, unitId, active }: ClientUnitStatusActionProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const action = changeClientUnitStatusAction.bind(null, organizationSlug, clientId, unitId, !active);
  const [state, formAction, pending] = useActionState(action, initialState);
  const title = active ? "Inativar unidade?" : "Ativar unidade?";

  useEffect(() => {
    if (state.status === "success") dialogRef.current?.close();
  }, [state.status]);

  return (
    <>
      <button type="button" onClick={() => dialogRef.current?.showModal()} className={`min-h-10 rounded-lg px-2 text-sm font-semibold hover:bg-muted ${active ? "text-destructive" : "text-success"}`}>
        {active ? "Inativar" : "Ativar"}
      </button>
      <dialog ref={dialogRef} aria-labelledby={`unit-status-title-${unitId}`} className="m-auto w-[min(30rem,calc(100%-2rem))] rounded-2xl border border-border bg-popover p-0 text-popover-foreground shadow-2xl" onClick={(event) => { if (event.target === dialogRef.current && !pending) dialogRef.current?.close(); }} onCancel={(event) => { if (pending) event.preventDefault(); }}>
        <div className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className={`mb-3 grid size-10 place-items-center rounded-full ${active ? "bg-destructive/10 text-destructive" : "bg-success/10 text-success"}`}>
                {active ? <PowerOff aria-hidden="true" className="size-5" /> : <Power aria-hidden="true" className="size-5" />}
              </div>
              <h2 id={`unit-status-title-${unitId}`} className="text-lg font-semibold">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {active ? "A unidade deixará de estar disponível para novas viagens. Os dados históricos serão preservados." : "A unidade voltará a ficar disponível para novos planejamentos, desde que o cliente esteja ativo."}
              </p>
            </div>
            <button type="button" disabled={pending} onClick={() => dialogRef.current?.close()} aria-label="Fechar confirmação" className="grid size-10 shrink-0 place-items-center rounded-lg text-muted-foreground hover:bg-muted disabled:opacity-50"><X aria-hidden="true" className="size-5" /></button>
          </div>
          {state.message ? <div className="mt-4"><InlineAlert tone={state.status === "error" ? "error" : "success"}>{state.message}</InlineAlert></div> : null}
          <form action={formAction} className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="secondary" disabled={pending} onClick={() => dialogRef.current?.close()}>Cancelar</Button>
            <button type="submit" disabled={pending} className={buttonStyles({ variant: active ? "destructive" : "primary" })}>{pending ? (active ? "Inativando..." : "Ativando...") : title.replace("?", "")}</button>
          </form>
        </div>
      </dialog>
    </>
  );
}
