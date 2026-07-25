import { ShieldCheck } from "lucide-react";
import Link from "next/link";

import { PageContainer } from "@/components/page/page-container";
import { PageHeader } from "@/components/page/page-header";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { DashboardAttention } from "@/features/dashboard/components/dashboard-attention";
import { DashboardMetrics } from "@/features/dashboard/components/dashboard-metrics";
import { DashboardQuickActions } from "@/features/dashboard/components/dashboard-quick-actions";
import { DashboardResourceSummary } from "@/features/dashboard/components/dashboard-resource-summary";
import { DashboardTripSection } from "@/features/dashboard/components/dashboard-trip-section";
import { getOperationalDashboard } from "@/features/dashboard/queries/get-operational-dashboard";
import { requireOrganizationMember } from "@/features/organizations/application/require-organization-member";
import { organizationRoleLabels } from "@/features/organizations/types/organization";

type OrganizationDashboardPageProps = { params: Promise<{ organizationSlug: string }> };

export default async function OrganizationDashboardPage({ params }: OrganizationDashboardPageProps) {
  const { organizationSlug } = await params;
  const context = await requireOrganizationMember(organizationSlug);

  if (context.membership.role === "technician") {
    return (
      <PageContainer className="max-w-6xl space-y-6">
        <PageHeader title="Visão geral" eyebrow={context.organization.name} description="Seu acesso segue as permissões operacionais atribuídas nesta organização." />
        <section className="rounded-2xl border border-border bg-card p-5 sm:p-6"><div className="flex items-start gap-4"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent text-accent-foreground"><ShieldCheck aria-hidden="true" className="size-5" /></span><div><div className="flex flex-wrap items-center gap-2"><h2 className="text-lg font-semibold text-card-foreground">Acesso técnico</h2><Badge tone="neutral">{organizationRoleLabels[context.membership.role]}</Badge></div><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Os indicadores consolidados de planejamento são restritos aos papéis administrativos. Nenhum dado operacional de outras pessoas ou recursos foi carregado nesta página.</p></div></div></section>
      </PageContainer>
    );
  }

  const data = await getOperationalDashboard(organizationSlug);
  const dateLabel = new Intl.DateTimeFormat("pt-BR", { dateStyle: "full", timeZone: data.timezone }).format(new Date(data.referenceTime));

  return (
    <PageContainer className="max-w-7xl space-y-6">
      <PageHeader title="Visão geral" eyebrow={context.organization.name} description={`Acompanhe o planejamento e a operação em ${dateLabel}.`} actions={<Link href={`/app/${organizationSlug}/planejamento/viagens/nova`} className={`${buttonStyles()} w-full sm:w-auto`}>Nova viagem</Link>} />
      <DashboardMetrics organizationSlug={organizationSlug} data={data} />
      <DashboardAttention organizationSlug={organizationSlug} data={data} />
      <div className="grid gap-6 xl:grid-cols-2">
        <DashboardTripSection organizationSlug={organizationSlug} title="Em execução" description="Viagens que já iniciaram o fluxo operacional." emptyMessage="Nenhuma viagem em execução no momento." trips={data.activeTrips} timezone={data.timezone} />
        <DashboardTripSection organizationSlug={organizationSlug} title="Próximas viagens" description="Planejadas ou confirmadas com período futuro." emptyMessage="Nenhuma próxima viagem planejada ou confirmada." trips={data.upcomingTrips} timezone={data.timezone} />
      </div>
      <DashboardResourceSummary organizationSlug={organizationSlug} data={data} />
      <DashboardQuickActions organizationSlug={organizationSlug} />
    </PageContainer>
  );
}
