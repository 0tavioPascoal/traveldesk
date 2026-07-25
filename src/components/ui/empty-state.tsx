import Link from "next/link";
import { Inbox, type LucideIcon } from "lucide-react";

import { buttonStyles } from "@/components/ui/button";

export function EmptyState({ title, description, action, icon: Icon = Inbox }: { title: string; description: string; action?: { href: string; label: string }; icon?: LucideIcon }) {
  return <section className="rounded-2xl border border-dashed border-border bg-card px-6 py-12 text-center"><Icon aria-hidden="true" className="mx-auto size-8 text-muted-foreground" /><h2 className="mt-4 text-base font-semibold text-card-foreground">{title}</h2><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">{description}</p>{action ? <Link href={action.href} className={`${buttonStyles()} mt-5`}>{action.label}</Link> : null}</section>;
}
