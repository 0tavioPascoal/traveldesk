import { TriangleAlert } from "lucide-react";
import Link from "next/link";

import { InlineAlert } from "@/components/ui/inline-alert";
import type { OperationalDashboardData } from "@/features/dashboard/types/operational-dashboard";

export function DashboardAttention({ organizationSlug, data }: { organizationSlug: string; data: OperationalDashboardData }) {
  const base = `/app/${organizationSlug}/planejamento/viagens`;
  if (!data.metrics.urgentOpen && !data.metrics.drafts && !data.metrics.confirmed) return null;
  return <InlineAlert tone="warning"><div><p className="flex items-center gap-2 font-semibold"><TriangleAlert aria-hidden="true" className="size-4" />Pontos de atenção por situação</p><div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-sm">{data.metrics.urgentOpen ? <Link href={`${base}?priority=urgent`} className="underline underline-offset-2">{data.metrics.urgentOpen} urgente{data.metrics.urgentOpen === 1 ? "" : "s"} em aberto</Link> : null}{data.metrics.drafts ? <Link href={`${base}?status=draft`} className="underline underline-offset-2">{data.metrics.drafts} rascunho{data.metrics.drafts === 1 ? "" : "s"}</Link> : null}{data.metrics.confirmed ? <Link href={`${base}?status=confirmed`} className="underline underline-offset-2">{data.metrics.confirmed} confirmada{data.metrics.confirmed === 1 ? "" : "s"} aguardando execução</Link> : null}</div><p className="mt-2 text-xs leading-5">A prontidão completa continua sendo validada no detalhe de cada viagem.</p></div></InlineAlert>;
}
