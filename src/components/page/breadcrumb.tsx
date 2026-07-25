import Link from "next/link";
import { ChevronRight } from "lucide-react";

export type BreadcrumbItem = { label: string; href?: string };

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return <nav aria-label="Breadcrumb"><ol className="flex flex-wrap items-center gap-1 text-sm text-subtle-foreground">{items.map((item, index) => <li key={`${item.label}-${index}`} className="flex items-center gap-1">{index > 0 ? <ChevronRight aria-hidden="true" className="size-4" /> : null}{item.href ? <Link href={item.href} className="rounded hover:text-foreground">{item.label}</Link> : <span aria-current="page" className="text-muted-foreground">{item.label}</span>}</li>)}</ol></nav>;
}
