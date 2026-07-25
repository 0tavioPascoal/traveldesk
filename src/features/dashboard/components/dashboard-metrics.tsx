import Link from "next/link";
import { CalendarDays, CircleDotDashed, ClipboardCheck, Route } from "lucide-react";

import type { OperationalDashboardData } from "@/features/dashboard/types/operational-dashboard";

export function DashboardMetrics({ organizationSlug, data }: { organizationSlug: string; data: OperationalDashboardData }) {
  const base = `/app/${organizationSlug}/planejamento/viagens`;
  const items = [
    { label: "Viagens hoje", value: data.metrics.tripsToday, description: "Com período sobrepondo o dia atual", href: `${base}?startsOn=${data.referenceDate}&endsOn=${data.referenceDate}`, icon: CalendarDays },
    { label: "Em execução", value: data.metrics.inExecution, description: "Deslocamento, cliente, atendimento ou retorno", href: base, icon: Route },
    { label: "Planejadas", value: data.metrics.planned, description: "Aguardando confirmação conforme a prontidão", href: `${base}?status=planned`, icon: ClipboardCheck },
    { label: "Rascunhos", value: data.metrics.drafts, description: "Ainda em preparação", href: `${base}?status=draft`, icon: CircleDotDashed },
  ];
  return (
    <section aria-labelledby="dashboard-metrics-title">
      <h2 id="dashboard-metrics-title" className="sr-only">Resumo das viagens</h2>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {items.map(({ label, value, description, href, icon: Icon }) => <Link key={label} href={href} className="group rounded-2xl border border-border bg-card p-4 transition-colors hover:border-input hover:bg-muted/35"><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-medium text-muted-foreground">{label}</p><p className="mt-2 text-3xl font-bold tracking-tight text-card-foreground">{value}</p></div><span className="grid size-9 place-items-center rounded-lg bg-muted text-muted-foreground transition-colors group-hover:text-foreground"><Icon aria-hidden="true" className="size-5" /></span></div><p className="mt-3 text-xs leading-5 text-muted-foreground">{description}</p></Link>)}
      </div>
    </section>
  );
}
