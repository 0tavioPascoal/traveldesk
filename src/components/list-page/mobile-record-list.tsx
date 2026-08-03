import type { ReactNode } from "react";

export function MobileRecordList({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
}) {
  return (
    <div className="grid gap-2.5 lg:hidden" aria-label={label}>
      {children}
    </div>
  );
}

export function MobileRecordCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <article
      className={`rounded-xl border border-border bg-card p-3.5 ${className}`}
    >
      {children}
    </article>
  );
}
