"use client";

import { SlidersHorizontal, X } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { useRef } from "react";

import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";

export function ListFilterDialog({
  action,
  title,
  description,
  activeCount,
  clearHref,
  children,
}: {
  action: string;
  title: string;
  description: string;
  activeCount: number;
  clearHref: string;
  children: ReactNode;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = `${title.toLocaleLowerCase("pt-BR").replace(/\s+/g, "-")}-title`;

  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        className={`${buttonStyles({ variant: "secondary", size: "sm" })} shrink-0`}
      >
        <SlidersHorizontal aria-hidden="true" className="size-4" />
        <span className="sr-only sm:not-sr-only">Filtros</span>
        {activeCount > 0 ? <Badge tone="primary">{activeCount}</Badge> : null}
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        className="m-auto max-h-[calc(100dvh-2rem)] w-[min(52rem,calc(100%-2rem))] overflow-y-auto rounded-xl border border-border bg-popover p-0 text-popover-foreground shadow-2xl backdrop:bg-background/75 backdrop:backdrop-blur-sm max-sm:m-0 max-sm:ml-auto max-sm:h-dvh max-sm:max-h-none max-sm:w-[min(28rem,100%)] max-sm:rounded-none"
        onClick={(event) => {
          if (event.target === dialogRef.current) dialogRef.current?.close();
        }}
      >
        <form action={action} className="grid min-h-full grid-rows-[auto_1fr_auto]">
          <header className="flex items-start justify-between gap-4 border-b border-border px-5 py-4 sm:px-6">
            <div className="min-w-0">
              <h2 id={titleId} className="text-lg font-semibold">
                {title}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            </div>
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              aria-label="Fechar filtros"
              className={`${buttonStyles({ variant: "ghost", size: "sm" })} shrink-0 px-2.5`}
            >
              <X aria-hidden="true" className="size-5" />
            </button>
          </header>

          <div className="px-5 py-5 sm:px-6">{children}</div>

          <footer className="flex flex-col-reverse gap-2 border-t border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-end sm:px-6">
            {activeCount > 0 ? (
              <Link
                href={clearHref}
                className={buttonStyles({ variant: "secondary", size: "sm" })}
              >
                Limpar filtros
              </Link>
            ) : null}
            <button type="submit" className={buttonStyles({ size: "sm" })}>
              Aplicar filtros
            </button>
          </footer>
        </form>
      </dialog>
    </>
  );
}
