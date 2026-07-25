"use client";

import Link from "next/link";
import { MoreHorizontal } from "lucide-react";
import { useRef } from "react";

import { buttonStyles } from "@/components/ui/button";
import { UnavailabilityStatusAction } from "@/features/unavailabilities/components/unavailability-status-action";
import type { UnavailabilityResourceKind } from "@/features/unavailabilities/types/unavailability";

export function UnavailabilityRowActions({ organizationSlug, resource, unavailabilityId, resourceId, resourceName, active, canEdit }: { organizationSlug: string; resource: UnavailabilityResourceKind; unavailabilityId: string; resourceId: string; resourceName: string; active: boolean; canEdit: boolean }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const segment = resource === "technicians" ? "tecnicos" : "veiculos";
  const editPath = `/app/${organizationSlug}/planejamento/indisponibilidades/${segment}/${unavailabilityId}/editar`;
  const resourcePath = `/app/${organizationSlug}/cadastros/${segment}/${resourceId}`;
  return <><button type="button" aria-label={`Abrir ações da indisponibilidade de ${resourceName}`} onClick={() => dialogRef.current?.showModal()} className={buttonStyles({ variant: "ghost", size: "sm" })}><MoreHorizontal aria-hidden="true" className="size-5" /></button><dialog ref={dialogRef} aria-labelledby={`unavailability-actions-${unavailabilityId}`} className="m-auto w-[min(30rem,calc(100%-2rem))] rounded-2xl border border-border bg-popover p-0 text-popover-foreground shadow-2xl" onClick={(event) => { if (event.target === dialogRef.current) dialogRef.current?.close(); }}><div className="space-y-5 p-5 sm:p-6"><div><h2 id={`unavailability-actions-${unavailabilityId}`} className="text-lg font-semibold">Ações da indisponibilidade</h2><p className="mt-1 text-sm text-muted-foreground">{resourceName}</p></div><div className="grid gap-2 sm:grid-cols-2">{canEdit ? <Link href={editPath} className={buttonStyles({ variant: "secondary" })}>Editar período</Link> : null}<Link href={resourcePath} className={buttonStyles({ variant: "secondary" })}>Abrir {resource === "technicians" ? "técnico" : "veículo"}</Link></div><div className="border-t border-border pt-5"><UnavailabilityStatusAction organizationSlug={organizationSlug} resource={resource} id={unavailabilityId} active={active} resourceName={resourceName} /></div><div className="flex justify-end"><button type="button" onClick={() => dialogRef.current?.close()} className={buttonStyles({ variant: "ghost" })}>Fechar</button></div></div></dialog></>;
}
