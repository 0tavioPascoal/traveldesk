import type { ReactNode } from "react";

export const listToolbarUtilitiesStyles =
  "col-span-3 row-start-2 flex min-w-0 items-center gap-2 md:col-span-1 md:col-start-2 md:row-start-1 md:w-full md:justify-self-end lg:max-w-2xl";

export const listToolbarSearchFormStyles = "min-w-0 flex-1";

export function ListToolbar({
  actions,
  children,
  columnControl,
  label = "Ações e controles da listagem",
}: {
  actions: ReactNode;
  children: ReactNode;
  columnControl?: ReactNode;
  label?: string;
}) {
  return (
    <section
      aria-label={label}
      className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 rounded-xl border border-border bg-card p-2"
    >
      <div className="col-start-1 row-start-1 flex min-w-0 flex-wrap items-center gap-2">
        {actions}
      </div>
      {children}
      {columnControl ? (
        <div className="col-start-3 row-start-1 shrink-0 justify-self-end">
          {columnControl}
        </div>
      ) : null}
    </section>
  );
}
