"use client";

import Link from "next/link";
import { MoreHorizontal } from "lucide-react";
import { useRef } from "react";

import { buttonStyles } from "@/components/ui/button";
import { TechnicianStatusAction } from "@/features/technicians/components/technician-status-action";

export function TechnicianDetailActions({ organizationSlug, technicianId, technicianName, active }: { organizationSlug: string; technicianId: string; technicianName: string; active: boolean }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const base = `/app/${organizationSlug}/cadastros/tecnicos`;
  return <div className="flex flex-col gap-2 sm:flex-row">
    <Link href={`${base}/${technicianId}/editar`} className={buttonStyles()}>Editar técnico</Link>
    <button type="button" onClick={() => dialogRef.current?.showModal()} aria-label="Abrir outras ações do técnico" className={buttonStyles({ variant: "secondary" })}><MoreHorizontal aria-hidden="true" className="size-5" /><span className="sm:hidden">Mais ações</span></button>
    <dialog ref={dialogRef} aria-labelledby="technician-detail-actions-title" className="m-auto w-[min(32rem,calc(100%-2rem))] rounded-2xl border border-border bg-popover p-0 text-popover-foreground shadow-2xl">
      <div className="space-y-5 p-5 sm:p-6"><div><h2 id="technician-detail-actions-title" className="text-lg font-semibold">Ações do técnico</h2><p className="mt-1 text-sm text-muted-foreground">{technicianName}</p></div>
        <div className="grid gap-2 sm:grid-cols-2"><Link href={`${base}/${technicianId}/editar#especialidades`} className={buttonStyles({ variant: "secondary" })}>Gerenciar especialidades</Link>{active ? <Link href={`/app/${organizationSlug}/planejamento/indisponibilidades/tecnicos/nova?technicianId=${technicianId}`} className={buttonStyles({ variant: "secondary" })}>Registrar indisponibilidade</Link> : null}<Link href={base} className={buttonStyles({ variant: "secondary" })}>Voltar à listagem</Link></div>
        <div className="border-t border-border pt-5"><TechnicianStatusAction organizationSlug={organizationSlug} technicianId={technicianId} technicianName={technicianName} active={active} /></div>
        <div className="flex justify-end"><button type="button" onClick={() => dialogRef.current?.close()} className={buttonStyles({ variant: "ghost" })}>Fechar</button></div>
      </div>
    </dialog>
  </div>;
}
