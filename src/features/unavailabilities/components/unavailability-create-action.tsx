"use client";

import Link from "next/link";
import { CarFront, Plus, UserRound } from "lucide-react";
import { useRef } from "react";

import { buttonStyles } from "@/components/ui/button";

export function UnavailabilityCreateAction({ organizationSlug }: { organizationSlug: string }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const base = `/app/${organizationSlug}/planejamento/indisponibilidades`;
  return <><button type="button" onClick={() => dialogRef.current?.showModal()} className={buttonStyles()}><Plus aria-hidden="true" className="size-4" />Nova indisponibilidade</button><dialog ref={dialogRef} aria-labelledby="new-unavailability-title" className="m-auto w-[min(34rem,calc(100%-2rem))] rounded-2xl border border-border bg-popover p-0 text-popover-foreground shadow-2xl" onClick={(event) => { if (event.target === dialogRef.current) dialogRef.current?.close(); }}><div className="space-y-5 p-5 sm:p-6"><div><h2 id="new-unavailability-title" className="text-lg font-semibold">Qual recurso ficará indisponível?</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Cada opção mantém seus tipos configuráveis e validações específicas.</p></div><div className="grid gap-3 sm:grid-cols-2"><Link href={`${base}/tecnicos/nova`} className="rounded-xl border border-border p-4 hover:border-primary hover:bg-accent"><UserRound aria-hidden="true" className="size-5 text-primary" /><span className="mt-3 block font-semibold">Técnico</span><span className="mt-1 block text-sm leading-5 text-muted-foreground">Registrar ausência ou bloqueio de um técnico.</span></Link><Link href={`${base}/veiculos/nova`} className="rounded-xl border border-border p-4 hover:border-primary hover:bg-accent"><CarFront aria-hidden="true" className="size-5 text-primary" /><span className="mt-3 block font-semibold">Veículo</span><span className="mt-1 block text-sm leading-5 text-muted-foreground">Registrar manutenção ou bloqueio de um veículo.</span></Link></div><div className="flex justify-end"><button type="button" onClick={() => dialogRef.current?.close()} className={buttonStyles({ variant: "secondary" })}>Cancelar</button></div></div></dialog></>;
}
