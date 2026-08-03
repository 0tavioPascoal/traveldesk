"use client";

import { Columns3, X } from "lucide-react";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useSyncExternalStore,
} from "react";

import { buttonStyles } from "@/components/ui/button";

type ColumnOption = {
  key: string;
  label: string;
};

function defaultVisibility(columns: ColumnOption[]) {
  return Object.fromEntries(columns.map((column) => [column.key, true]));
}

function parseVisibility(value: string, columns: ColumnOption[]) {
  if (!value) return defaultVisibility(columns);

  try {
    const parsed = JSON.parse(value) as Record<string, unknown>;
    return Object.fromEntries(
      columns.map((column) => [
        column.key,
        parsed[column.key] !== false,
      ]),
    );
  } catch {
    return defaultVisibility(columns);
  }
}

export function ColumnVisibilityMenu({
  columns,
  listKey,
}: {
  columns: ColumnOption[];
  listKey: string;
}) {
  const storageKey = `traveldesk:list-columns:${listKey}`;
  const eventName = `${storageKey}:change`;
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const subscribe = useCallback(
    (notify: () => void) => {
      window.addEventListener("storage", notify);
      window.addEventListener(eventName, notify);
      return () => {
        window.removeEventListener("storage", notify);
        window.removeEventListener(eventName, notify);
      };
    },
    [eventName],
  );
  const getSnapshot = useCallback(
    () => window.localStorage.getItem(storageKey) ?? "",
    [storageKey],
  );
  const stored = useSyncExternalStore(subscribe, getSnapshot, () => "");
  const visible = useMemo(
    () => parseVisibility(stored, columns),
    [columns, stored],
  );

  useEffect(() => {
    for (const column of columns) {
      const elements = document.querySelectorAll<HTMLElement>(
        `[data-list-column="${listKey}:${column.key}"]`,
      );
      for (const element of elements) {
        element.hidden = visible[column.key] === false;
      }
    }
  }, [columns, listKey, visible]);

  function save(next: Record<string, boolean>) {
    window.localStorage.setItem(storageKey, JSON.stringify(next));
    window.dispatchEvent(new Event(eventName));
  }

  return (
    <>
      <button
        type="button"
        aria-label="Escolher colunas visíveis"
        onClick={() => dialogRef.current?.showModal()}
        className={buttonStyles({ variant: "secondary", size: "sm" })}
      >
        <Columns3 aria-hidden="true" className="size-4" />
        <span className="hidden sm:inline">Colunas</span>
      </button>
      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        className="m-auto w-[min(24rem,calc(100%-2rem))] rounded-xl border border-border bg-popover p-0 text-popover-foreground shadow-2xl"
        onClick={(event) => {
          if (event.target === dialogRef.current) dialogRef.current?.close();
        }}
      >
        <div className="space-y-4 p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 id={titleId} className="font-semibold">
                Colunas visíveis
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                As colunas principal, situação e ações permanecem visíveis.
              </p>
            </div>
            <button
              type="button"
              aria-label="Fechar seletor de colunas"
              onClick={() => dialogRef.current?.close()}
              className="grid size-9 place-items-center rounded-lg text-muted-foreground hover:bg-muted"
            >
              <X aria-hidden="true" className="size-4" />
            </button>
          </div>
          <fieldset className="grid gap-1">
            <legend className="sr-only">Colunas secundárias</legend>
            {columns.map((column) => (
              <label
                key={column.key}
                className="flex min-h-10 items-center gap-3 rounded-lg px-2 text-sm hover:bg-muted"
              >
                <input
                  type="checkbox"
                  checked={visible[column.key] !== false}
                  onChange={(event) =>
                    save({
                      ...visible,
                      [column.key]: event.target.checked,
                    })
                  }
                  className="size-4 accent-primary"
                />
                {column.label}
              </label>
            ))}
          </fieldset>
          <div className="flex justify-end border-t border-border pt-3">
            <button
              type="button"
              onClick={() => save(defaultVisibility(columns))}
              className={buttonStyles({ variant: "ghost", size: "sm" })}
            >
              Restaurar padrão
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}
