"use client";

import Link from "next/link";
import { MoreHorizontal } from "lucide-react";
import { useRef } from "react";

import { buttonStyles } from "@/components/ui/button";
import { VehicleActiveStateAction } from "@/features/vehicles/components/vehicle-active-state-action";
import { VehicleStatusAction } from "@/features/vehicles/components/vehicle-status-action";
import type { VehicleOperationalStatus } from "@/features/vehicles/types/vehicle";

export function VehicleRowActions({ organizationSlug, vehicleId, plate, active, operationalStatus }: { organizationSlug: string; vehicleId: string; plate: string; active: boolean; operationalStatus: VehicleOperationalStatus }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const base = `/app/${organizationSlug}/cadastros/veiculos/${vehicleId}`;
  return <><button type="button" aria-label={`Abrir ações do veículo ${plate}`} onClick={() => dialogRef.current?.showModal()} className={buttonStyles({ variant: "ghost", size: "sm" })}><MoreHorizontal aria-hidden="true" className="size-5" /></button><dialog ref={dialogRef} aria-labelledby={`vehicle-actions-${vehicleId}`} className="m-auto w-[min(30rem,calc(100%-2rem))] rounded-2xl border border-border bg-popover p-0 text-popover-foreground shadow-2xl"><div className="space-y-5 p-5 sm:p-6"><div><h2 id={`vehicle-actions-${vehicleId}`} className="text-lg font-semibold">Ações do veículo</h2><p className="mt-1 font-mono text-sm text-muted-foreground">{plate}</p></div><div className="grid gap-2 sm:grid-cols-2"><Link href={base} className={buttonStyles({ variant: "secondary" })}>Visualizar</Link><Link href={`${base}/editar`} className={buttonStyles({ variant: "secondary" })}>Editar</Link>{active ? <Link href={`/app/${organizationSlug}/planejamento/indisponibilidades/veiculos/nova?vehicleId=${vehicleId}`} className={buttonStyles({ variant: "secondary" })}>Registrar indisponibilidade</Link> : null}</div><div className="flex flex-wrap gap-2 border-t border-border pt-5"><VehicleStatusAction organizationSlug={organizationSlug} vehicleId={vehicleId} currentStatus={operationalStatus} vehicleLabel={plate} /><VehicleActiveStateAction organizationSlug={organizationSlug} vehicleId={vehicleId} vehicleLabel={plate} active={active} /></div><div className="flex justify-end"><button type="button" onClick={() => dialogRef.current?.close()} className={buttonStyles({ variant: "ghost" })}>Fechar</button></div></div></dialog></>;
}
