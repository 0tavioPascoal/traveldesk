import type { ReactNode } from "react";

export function SectionHeader({ title, description, actions, id }: { title: string; description?: string; actions?: ReactNode; id?: string }) {
  return <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><h2 id={id} className="text-lg font-semibold text-foreground">{title}</h2>{description ? <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p> : null}</div>{actions ? <div className="shrink-0">{actions}</div> : null}</div>;
}
