"use client";

import { useActionState, useId, useRef } from "react";

import { Button, buttonStyles } from "@/components/ui/button";
import { InlineAlert } from "@/components/ui/inline-alert";

type StatusState = {
  status: "idle" | "success" | "error";
  message: string | null;
};

type CatalogStatusDialogProps = {
  action: (state: StatusState, formData: FormData) => Promise<StatusState>;
  active: boolean;
  entityName: string;
  deactivateDescription: string;
  reactivateDescription: string;
};

const initialState: StatusState = { status: "idle", message: null };

export function CatalogStatusDialog({
  action,
  active,
  entityName,
  deactivateDescription,
  reactivateDescription,
}: CatalogStatusDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const [state, formAction, pending] = useActionState(action, initialState);
  const title = active ? `Inativar ${entityName}?` : `Reativar ${entityName}?`;
  const description = active ? deactivateDescription : reactivateDescription;

  return (
    <>
      <button
        type="button"
        aria-label={active ? `Inativar ${entityName}` : `Reativar ${entityName}`}
        onClick={() => dialogRef.current?.showModal()}
        className={active ? "text-sm font-semibold text-destructive hover:underline" : "text-sm font-semibold text-primary hover:underline"}
      >
        {active ? "Inativar" : "Ativar"}
      </button>
      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        className="m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl border border-border bg-popover p-0 text-popover-foreground shadow-xl backdrop:bg-foreground/35"
        onClick={(event) => {
          if (event.target === event.currentTarget && !pending) event.currentTarget.close();
        }}
      >
        <form action={formAction} className="space-y-5 p-5 sm:p-6">
          <div>
            <h2 id={titleId} className="text-lg font-semibold text-foreground">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
          </div>
          {state.message ? <InlineAlert tone={state.status === "error" ? "error" : "success"}>{state.message}</InlineAlert> : null}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button type="button" variant="secondary" disabled={pending} onClick={() => dialogRef.current?.close()}>
              Cancelar
            </Button>
            <button type="submit" disabled={pending} className={buttonStyles({ variant: active ? "destructive" : "primary" })}>
              {pending ? "Salvando..." : active ? "Inativar" : "Reativar"}
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}
