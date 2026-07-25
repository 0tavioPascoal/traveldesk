import { CalendarOff, CarFront, Contact, IdCard } from "lucide-react";
import Link from "next/link";

import { SectionHeader } from "@/components/page/section-header";
import type { OperationalDashboardData } from "@/features/dashboard/types/operational-dashboard";

export function DashboardResourceSummary({ organizationSlug, data }: { organizationSlug: string; data: OperationalDashboardData }) {
  const items = [
    { label: "Técnicos ativos", value: data.resources.activeTechnicians, detail: `${data.resources.unavailableTechnicians} indisponíveis agora`, href: `/app/${organizationSlug}/cadastros/tecnicos`, icon: Contact },
    { label: "Veículos disponíveis", value: data.resources.availableVehicles, detail: `${data.resources.unavailableVehicles} indisponíveis agora`, href: `/app/${organizationSlug}/cadastros/veiculos`, icon: CarFront },
    { label: "CNHs vencidas", value: data.resources.expiredDriverLicenses, detail: "Entre técnicos ativos autorizados a dirigir", href: `/app/${organizationSlug}/cadastros/tecnicos`, icon: IdCard },
    { label: "Indisponibilidades atuais", value: data.resources.unavailableTechnicians + data.resources.unavailableVehicles, detail: "Técnicos e veículos com período ativo", href: `/app/${organizationSlug}/planejamento/indisponibilidades?temporalStatus=current`, icon: CalendarOff },
  ];
  return <section className="rounded-2xl border border-border bg-card p-5 sm:p-6"><SectionHeader title="Recursos operacionais" description={`Situação na referência atual da organização · ${data.timezone}.`} /><div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{items.map(({ label, value, detail, href, icon: Icon }) => <Link key={label} href={href} className="rounded-xl border border-border p-4 transition-colors hover:border-input hover:bg-muted/35"><div className="flex items-center gap-2 text-sm font-medium text-muted-foreground"><Icon aria-hidden="true" className="size-4" />{label}</div><p className="mt-2 text-2xl font-bold text-card-foreground">{value}</p><p className="mt-1 text-xs leading-5 text-muted-foreground">{detail}</p></Link>)}</div></section>;
}
