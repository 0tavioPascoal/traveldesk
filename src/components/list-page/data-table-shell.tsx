import type { ReactNode } from "react";

export const dataTableStyles = "w-full text-left text-sm";
export const dataTableHeaderStyles =
  "h-11 border-b border-border bg-muted/60 text-xs font-medium text-muted-foreground";
export const dataTableHeadingStyles = "px-3 py-2.5 font-medium";
export const dataTableRowStyles =
  "transition-colors hover:bg-muted/35 focus-within:bg-muted/35";
export const dataTableCellStyles = "px-3 py-3 align-top";

export function DataTableShell({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`hidden overflow-x-auto rounded-xl border border-border bg-card [&_td]:px-3 [&_td]:py-3 [&_th]:px-3 [&_th]:py-2.5 lg:block ${className}`}
    >
      {children}
    </div>
  );
}
