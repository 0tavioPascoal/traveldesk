"use client";

import { X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef } from "react";

import { Button, buttonStyles } from "@/components/ui/button";

export function ClientFormCancel({ href, dirty }: { href: string; dirty: boolean }) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  if (!dirty) return <Link href={href} className={buttonStyles({ variant: "secondary" })}>Cancelar</Link>;

  return (
    <>
      <Button type="button" variant="secondary" onClick={() => dialogRef.current?.showModal()}>Cancelar</Button>
      <dialog ref={dialogRef} aria-labelledby="discard-client-form-title" className="m-auto w-[min(30rem,calc(100%-2rem))] rounded-2xl border border-border bg-popover p-0 text-popover-foreground shadow-2xl" onClick={(event) => { if (event.target === dialogRef.current) dialogRef.current?.close(); }}>
        <div className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div><h2 id="discard-client-form-title" className="text-lg font-semibold">Descartar alterações?</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">As informações preenchidas desde o último salvamento serão perdidas.</p></div>
            <button type="button" onClick={() => dialogRef.current?.close()} aria-label="Fechar confirmação" className="grid size-10 shrink-0 place-items-center rounded-lg text-muted-foreground hover:bg-muted"><X aria-hidden="true" className="size-5" /></button>
          </div>
          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><Button type="button" variant="secondary" onClick={() => dialogRef.current?.close()}>Continuar preenchendo</Button><Link href={href} className={buttonStyles({ variant: "destructive" })}>Descartar e sair</Link></div>
        </div>
      </dialog>
    </>
  );
}
