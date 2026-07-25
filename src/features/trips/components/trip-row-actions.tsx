"use client";

import { Eye, MoreHorizontal, Pencil, X } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";

import type { TripStatus } from "@/features/trips/types/trip";

export function TripRowActions({
  basePath,
  tripId,
  code,
  status,
}: {
  basePath: string;
  tripId: string;
  code: string;
  status: TripStatus;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const editable = status === "draft" || status === "planned";

  return (
    <>
      <button type="button" onClick={() => dialogRef.current?.showModal()} aria-label={`Abrir ações da viagem ${code}`} className="ml-auto grid size-10 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground">
        <MoreHorizontal aria-hidden="true" className="size-5" />
      </button>
      <dialog
        ref={dialogRef}
        aria-labelledby={`trip-actions-${tripId}`}
        className="m-auto w-[min(22rem,calc(100%-2rem))] rounded-2xl border border-border bg-popover p-0 text-popover-foreground shadow-2xl"
        onClick={(event) => {
          if (event.target === dialogRef.current) dialogRef.current?.close();
        }}
      >
        <div className="p-4">
          <div className="flex items-center justify-between gap-3 border-b border-border pb-3">
            <div><h2 id={`trip-actions-${tripId}`} className="font-semibold">Ações da viagem</h2><p className="mt-0.5 font-mono text-xs text-muted-foreground">{code}</p></div>
            <button type="button" onClick={() => dialogRef.current?.close()} aria-label="Fechar ações" className="grid size-10 place-items-center rounded-lg text-muted-foreground hover:bg-muted"><X aria-hidden="true" className="size-5" /></button>
          </div>
          <div className="mt-3 space-y-1">
            <Link href={`${basePath}/${tripId}`} className="flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium hover:bg-muted">
              <Eye aria-hidden="true" className="size-4" />Visualizar
            </Link>
            {editable ? (
              <Link href={`${basePath}/${tripId}/editar`} className="flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium hover:bg-muted">
                <Pencil aria-hidden="true" className="size-4" />Editar
              </Link>
            ) : null}
          </div>
          {!editable ? <p className="mt-3 border-t border-border pt-3 text-xs leading-5 text-muted-foreground">Outras ações operacionais estão disponíveis nos detalhes da viagem.</p> : null}
        </div>
      </dialog>
    </>
  );
}
