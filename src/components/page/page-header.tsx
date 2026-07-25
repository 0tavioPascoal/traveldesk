import type { ReactNode } from "react";

import { Breadcrumb, type BreadcrumbItem } from "@/components/page/breadcrumb";

export function PageHeader({ title, description, eyebrow, breadcrumbs, actions }: { title: string; description?: string; eyebrow?: string; breadcrumbs?: BreadcrumbItem[]; actions?: ReactNode }) {
  return <header className="space-y-4">{breadcrumbs ? <Breadcrumb items={breadcrumbs} /> : null}<div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div className="min-w-0">{eyebrow ? <p className="text-sm font-medium text-subtle-foreground">{eyebrow}</p> : null}<h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-[1.75rem]">{title}</h1>{description ? <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{description}</p> : null}</div>{actions ? <div className="shrink-0">{actions}</div> : null}</div></header>;
}
