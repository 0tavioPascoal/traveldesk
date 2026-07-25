"use client";

import { useRef, useState } from "react";
import { ArrowLeft, Check, Copy, MoreHorizontal, Pencil } from "lucide-react";
import Link from "next/link";

import { buttonStyles } from "@/components/ui/button";
import { TripStatusActions } from "@/features/trips/components/trip-status-actions";
import type { TripStatus } from "@/features/trips/types/trip";

export function TripActionsMenu({ organizationSlug, tripId, code, status, role, confirmedAt }: {
  organizationSlug: string;
  tripId: string;
  code: string;
  status: TripStatus;
  role: "admin" | "coordinator";
  confirmedAt: string | null;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [copied, setCopied] = useState(false);
  const base = `/app/${organizationSlug}/planejamento/viagens`;
  const editable = status === "draft" || status === "planned";

  async function copyCode() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <>
      <button type="button" onClick={() => dialogRef.current?.showModal()} aria-label="Abrir outras ações da viagem" className={buttonStyles({ variant: "secondary" })}>
        <MoreHorizontal aria-hidden="true" className="size-5" />
        <span className="sm:hidden">Mais ações</span>
      </button>
      <dialog ref={dialogRef} aria-labelledby="trip-actions-menu-title" className="m-auto w-[min(34rem,calc(100%-2rem))] rounded-2xl border border-border bg-popover p-0 text-popover-foreground shadow-2xl">
        <div className="space-y-5 p-5 sm:p-6">
          <div>
            <h2 id="trip-actions-menu-title" className="text-lg font-semibold">Ações da viagem</h2>
            <p className="mt-1 text-sm text-muted-foreground">Opções disponíveis para o status atual.</p>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <Link href={base} className={buttonStyles({ variant: "secondary" })}><ArrowLeft aria-hidden="true" className="size-4" />Voltar à listagem</Link>
            {editable ? <Link href={`${base}/${tripId}/editar`} className={buttonStyles({ variant: "secondary" })}><Pencil aria-hidden="true" className="size-4" />Editar dados</Link> : null}
            <button type="button" onClick={copyCode} className={buttonStyles({ variant: "secondary" })}>
              {copied ? <Check aria-hidden="true" className="size-4" /> : <Copy aria-hidden="true" className="size-4" />}
              {copied ? "Código copiado" : "Copiar código"}
            </button>
          </div>
          <div className="border-t border-border pt-5">
            <TripStatusActions organizationSlug={organizationSlug} tripId={tripId} status={status} role={role} confirmedAt={confirmedAt} />
          </div>
          <div className="flex justify-end">
            <button type="button" onClick={() => dialogRef.current?.close()} className={buttonStyles({ variant: "ghost" })}>Fechar</button>
          </div>
        </div>
      </dialog>
    </>
  );
}
