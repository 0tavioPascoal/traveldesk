"use client";

import Link from "next/link";
import { MoreHorizontal } from "lucide-react";
import { useRef } from "react";

import { buttonStyles } from "@/components/ui/button";
import { VehicleActiveStateAction } from "@/features/vehicles/components/vehicle-active-state-action";
import type { VehicleOperationalStatus } from "@/features/vehicles/types/vehicle";

export function VehicleDetailActions({ organizationSlug, vehicleId, plate, active }: { organizationSlug: string; vehicleId: string; plate: string; active: boolean; operationalStatus: VehicleOperationalStatus }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const base = `/app/${organizationSlug}/cadastros/veiculos`;
  return <div className="flex flex-col gap-2 sm:flex-row"><Link href={`${base}/${vehicleId}/editar`} className={buttonStyles()}>Editar veículo</Link><button type="button" onClick={() => dialogRef.current?.showModal()} aria-label="Abrir outras ações do veículo" className={buttonStyles({ variant: "secondary" })}><MoreHorizontal aria-hidden="true" className="size-5" /><span className="sm:hidden">Mais ações</span></button><dialog ref={dialogRef} aria-labelledby="vehicle-detail-actions-title" className="m-auto w-[min(32rem,calc(100%-2rem))] rounded-2xl border border-border bg-popover p-0 text-popover-foreground shadow-2xl"><div className="space-y-5 p-5 sm:p-6"><div><h2 id="vehicle-detail-actions-title" className="text-lg font-semibold">Ações do veículo</h2><p className="mt-1 font-mono text-sm text-muted-foreground">{plate}</p></div><div className="grid gap-2 sm:grid-cols-2">{active ? <Link href={`/app/${organizationSlug}/planejamento/indisponibilidades/veiculos/nova?vehicleId=${vehicleId}`} className={buttonStyles({ variant: "secondary" })}>Registrar indisponibilidade</Link> : null}<Link href={base} className={buttonStyles({ variant: "secondary" })}>Voltar à listagem</Link></div><div className="border-t border-border pt-5"><VehicleActiveStateAction organizationSlug={organizationSlug} vehicleId={vehicleId} vehicleLabel={plate} active={active} /></div><div className="flex justify-end"><button type="button" onClick={() => dialogRef.current?.close()} className={buttonStyles({ variant: "ghost" })}>Fechar</button></div></div></dialog></div>;
}
