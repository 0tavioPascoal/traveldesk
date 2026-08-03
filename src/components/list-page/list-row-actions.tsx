"use client";

import { MoreHorizontal, X } from "lucide-react";
import type { ReactNode } from "react";
import { useRef } from "react";

export const listActionItemStyles =
  "flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-left text-sm font-medium transition-colors hover:bg-muted";

export function ListRowActions({
  label,
  title,
  description,
  children,
}: {
  label: string;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  return (
    <>
      <button
        type="button"
        aria-label={label}
        onClick={() => dialogRef.current?.showModal()}
        className="ml-auto grid size-10 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <MoreHorizontal aria-hidden="true" className="size-5" />
      </button>
      <dialog
        ref={dialogRef}
        aria-label={title}
        className="m-auto w-[min(24rem,calc(100%-2rem))] rounded-2xl border border-border bg-popover p-0 text-popover-foreground shadow-2xl"
        onClick={(event) => {
          if (event.target === dialogRef.current) dialogRef.current?.close();
        }}
      >
        <div className="p-4">
          <div className="flex items-start justify-between gap-3 border-b border-border pb-3">
            <div>
              <h2 className="font-semibold">{title}</h2>
              {description ? (
                <p className="mt-1 text-sm text-muted-foreground">
                  {description}
                </p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              aria-label="Fechar ações"
              className="grid size-10 shrink-0 place-items-center rounded-lg text-muted-foreground hover:bg-muted"
            >
              <X aria-hidden="true" className="size-5" />
            </button>
          </div>
          <div className="mt-3 space-y-1">{children}</div>
        </div>
      </dialog>
    </>
  );
}
