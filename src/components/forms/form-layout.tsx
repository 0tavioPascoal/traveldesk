import type { ReactNode } from "react";

export const formControlClassName =
  "h-11 w-full rounded-lg border border-input bg-background px-3 text-base text-foreground outline-none transition placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground aria-[invalid=true]:border-destructive sm:text-sm";

export const formTextareaClassName =
  "min-h-32 w-full resize-y rounded-lg border border-input bg-background px-3 py-2.5 text-base leading-6 text-foreground outline-none transition placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground aria-[invalid=true]:border-destructive sm:text-sm";

export const formFieldClassName = "min-w-0 space-y-1.5";
export const formLabelClassName = "block text-sm font-medium text-foreground";
export const formHelpClassName = "text-xs leading-5 text-muted-foreground";
export const formErrorClassName = "text-sm text-destructive";
export const formSectionClassName =
  "rounded-2xl border border-border bg-card p-5 text-card-foreground sm:p-6";

export function RequiredIndicator() {
  return (
    <>
      <span className="text-destructive" aria-hidden="true">
        *
      </span>
      <span className="sr-only"> (obrigatório)</span>
    </>
  );
}

export function FormActions({ children }: { children: ReactNode }) {
  return (
    <footer className="flex flex-col-reverse gap-3 rounded-2xl border border-border bg-card p-3 sm:flex-row sm:items-center sm:justify-end">
      {children}
    </footer>
  );
}

export function FormSurface({ children }: { children: ReactNode }) {
  return <section className={formSectionClassName}>{children}</section>;
}
