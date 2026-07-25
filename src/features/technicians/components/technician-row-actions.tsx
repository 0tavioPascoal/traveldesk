"use client";

import Link from "next/link";
import { MoreHorizontal, Pencil, UserRound, Wrench } from "lucide-react";
import { useRef } from "react";

import { buttonStyles } from "@/components/ui/button";
import { TechnicianStatusAction } from "@/features/technicians/components/technician-status-action";

export function TechnicianRowActions({ organizationSlug, technicianId, technicianName, active }: {
  organizationSlug: string;
  technicianId: string;
  technicianName: string;
  active: boolean;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const base = `/app/${organizationSlug}/cadastros/tecnicos/${technicianId}`;
  return (
    <>
      <button type="button" aria-label={`Abrir ações de ${technicianName}`} onClick={() => dialogRef.current?.showModal()} className={buttonStyles({ variant: "ghost", size: "sm" })}>
        <MoreHorizontal aria-hidden="true" className="size-5" />
      </button>
      <dialog ref={dialogRef} aria-labelledby={`technician-actions-${technicianId}`} className="m-auto w-[min(30rem,calc(100%-2rem))] rounded-2xl border border-border bg-popover p-0 text-popover-foreground shadow-2xl">
        <div className="space-y-5 p-5 sm:p-6">
          <div><h2 id={`technician-actions-${technicianId}`} className="text-lg font-semibold">Ações do técnico</h2><p className="mt-1 text-sm text-muted-foreground">{technicianName}</p></div>
          <div className="grid gap-2 sm:grid-cols-2">
            <Link href={base} className={buttonStyles({ variant: "secondary" })}><UserRound aria-hidden="true" className="size-4" />Visualizar</Link>
            <Link href={`${base}/editar`} className={buttonStyles({ variant: "secondary" })}><Pencil aria-hidden="true" className="size-4" />Editar</Link>
            <Link href={`${base}#especialidades`} className={buttonStyles({ variant: "secondary" })}><Wrench aria-hidden="true" className="size-4" />Especialidades</Link>
            {active ? <Link href={`/app/${organizationSlug}/planejamento/indisponibilidades/tecnicos/nova?technicianId=${technicianId}`} className={buttonStyles({ variant: "secondary" })}>Registrar indisponibilidade</Link> : null}
          </div>
          <div className="border-t border-border pt-5"><TechnicianStatusAction organizationSlug={organizationSlug} technicianId={technicianId} technicianName={technicianName} active={active} /></div>
          <div className="flex justify-end"><button type="button" onClick={() => dialogRef.current?.close()} className={buttonStyles({ variant: "ghost" })}>Fechar</button></div>
        </div>
      </dialog>
    </>
  );
}
