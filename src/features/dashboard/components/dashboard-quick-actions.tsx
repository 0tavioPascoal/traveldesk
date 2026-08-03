import { CalendarPlus, CalendarRange, Plus, UsersRound } from "lucide-react";
import Link from "next/link";

export function DashboardQuickActions({ organizationSlug }: { organizationSlug: string }) {
  const actions = [
    { label: "Nova viagem", description: "Inicie um novo planejamento.", href: `/app/${organizationSlug}/planejamento/viagens/nova`, icon: Plus },
    { label: "Abrir escala", description: "Visualize a programação semanal.", href: `/app/${organizationSlug}/planejamento/escala`, icon: CalendarRange },
    { label: "Registrar indisponibilidade", description: "Bloqueie um técnico ou veículo.", href: `/app/${organizationSlug}/planejamento/indisponibilidades`, icon: CalendarPlus },
    { label: "Gerenciar técnicos", description: "Revise equipe, CNH e especialidades.", href: `/app/${organizationSlug}/cadastros/tecnicos`, icon: UsersRound },
  ];
  return <section aria-labelledby="quick-actions-title"><h2 id="quick-actions-title" className="text-lg font-semibold text-foreground">Ações rápidas</h2><div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{actions.map(({ label, description, href, icon: Icon }) => <Link key={label} href={href} className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-input hover:bg-muted/35"><span className="grid size-9 shrink-0 place-items-center rounded-lg bg-accent text-accent-foreground"><Icon aria-hidden="true" className="size-4" /></span><span><span className="block text-sm font-semibold text-card-foreground">{label}</span><span className="mt-1 block text-xs leading-5 text-muted-foreground">{description}</span></span></Link>)}</div></section>;
}
