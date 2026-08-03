import { CalendarDays, MapPin } from "lucide-react";
import Link from "next/link";

import {
  DataTableShell,
  dataTableHeaderStyles,
  dataTableStyles,
} from "@/components/list-page/data-table-shell";
import {
  MobileRecordCard,
  MobileRecordList,
} from "@/components/list-page/mobile-record-list";
import { EmptyState } from "@/components/ui/empty-state";
import { NoResultsState } from "@/components/ui/no-results-state";
import { TripPriorityBadge, TripStatusBadge } from "@/features/trips/components/trip-badges";
import { tripNextStepLabels } from "@/features/trips/components/trip-list-presentation";
import { TripRowActions } from "@/features/trips/components/trip-row-actions";
import type { TripListItem } from "@/features/trips/types/trip";

function period(item: TripListItem, timezone: string) {
  if (!item.travel_starts_at || !item.travel_ends_at) return null;
  const format = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: timezone,
  });
  return {
    start: format.format(new Date(item.travel_starts_at)),
    end: format.format(new Date(item.travel_ends_at)),
  };
}

export function TripList({
  organizationSlug,
  items,
  timezone,
  hasFilters,
}: {
  organizationSlug: string;
  items: TripListItem[];
  timezone: string;
  hasFilters: boolean;
}) {
  const base = `/app/${organizationSlug}/planejamento/viagens`;

  if (!items.length) {
    return hasFilters ? (
      <NoResultsState description="Revise os filtros ou limpe a pesquisa para encontrar outras viagens." action={{ href: base, label: "Limpar filtros" }} />
    ) : (
      <EmptyState title="Nenhuma viagem cadastrada" description="Crie a primeira viagem para começar o planejamento operacional." action={{ href: `${base}/nova`, label: "Nova viagem" }} />
    );
  }

  return (
    <>
      <DataTableShell>
        <table className={`${dataTableStyles} min-w-[1080px]`}>
          <caption className="sr-only">Viagens da organização</caption>
          <thead className={dataTableHeaderStyles}>
            <tr>
              <th scope="col" className="px-4 py-3">Código</th>
              <th scope="col" className="px-4 py-3">Viagem</th>
              <th data-list-column="trips:client" scope="col" className="px-4 py-3">Cliente e unidade</th>
              <th data-list-column="trips:period" scope="col" className="px-4 py-3">Período</th>
              <th data-list-column="trips:priority" scope="col" className="px-4 py-3">Prioridade</th>
              <th scope="col" className="px-4 py-3">Status</th>
              <th data-list-column="trips:nextStep" scope="col" className="px-4 py-3">Próxima etapa</th>
              <th scope="col" className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {items.map((item) => {
              const tripPeriod = period(item, timezone);
              return (
                <tr key={item.id} className={`transition-colors hover:bg-muted/45 focus-within:bg-muted/45 ${item.priority === "urgent" ? "border-l-2 border-l-destructive" : ""}`}>
                  <td className="whitespace-nowrap px-4 py-4 align-top font-mono text-xs text-muted-foreground">
                    <Link href={`${base}/${item.id}`} className="rounded-sm hover:text-foreground hover:underline">{item.code}</Link>
                  </td>
                  <td className="max-w-64 px-4 py-4 align-top">
                    <Link href={`${base}/${item.id}`} className="font-semibold text-card-foreground hover:text-primary hover:underline">{item.title}</Link>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">{item.serviceTypeName ?? "Sem tipo de atendimento"}{item.destination_city ? ` · ${item.destination_city}/${item.destination_state}` : ""}</p>
                  </td>
                  <td data-list-column="trips:client" className="max-w-56 px-4 py-4 align-top text-sm">
                    <p className="font-medium text-card-foreground">{item.client_name_snapshot}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{item.client_unit_name_snapshot}</p>
                  </td>
                  <td data-list-column="trips:period" className="whitespace-nowrap px-4 py-4 align-top text-xs text-muted-foreground">
                    {tripPeriod ? <><p>{tripPeriod.start}</p><p className="mt-1">→ {tripPeriod.end}</p></> : "Não informado"}
                  </td>
                  <td data-list-column="trips:priority" className="px-4 py-4 align-top"><TripPriorityBadge priority={item.priority} /></td>
                  <td className="px-4 py-4 align-top"><TripStatusBadge status={item.status} /></td>
                  <td data-list-column="trips:nextStep" className="max-w-40 px-4 py-4 align-top text-sm font-medium text-card-foreground">{tripNextStepLabels[item.status]}</td>
                  <td className="px-4 py-4 align-top"><TripRowActions basePath={base} tripId={item.id} code={item.code} status={item.status} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </DataTableShell>

      <MobileRecordList label="Viagens da organização">
        {items.map((item) => {
          const tripPeriod = period(item, timezone);
          return (
            <MobileRecordCard key={item.id} className={item.priority === "urgent" ? "border-destructive/45" : ""}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <Link href={`${base}/${item.id}`} className="rounded-sm font-mono text-xs text-muted-foreground hover:text-foreground hover:underline">{item.code}</Link>
                  <h2 className="mt-1 break-words font-semibold leading-6 text-card-foreground">{item.title}</h2>
                  <p className="mt-1 text-xs text-muted-foreground">{item.serviceTypeName ?? "Sem tipo de atendimento"}</p>
                </div>
                <TripStatusBadge status={item.status} />
              </div>
              <p data-list-column="trips:client" className="mt-3 text-sm text-card-foreground">{item.client_name_snapshot} <span aria-hidden="true" className="text-muted-foreground">·</span> {item.client_unit_name_snapshot}</p>
              <dl className="mt-4 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                <div data-list-column="trips:period" className="flex items-start gap-2"><CalendarDays aria-hidden="true" className="mt-0.5 size-4 shrink-0" /><dd>{tripPeriod ? <>{tripPeriod.start}<span className="block">→ {tripPeriod.end}</span></> : "Período não informado"}</dd></div>
                <div className="flex items-center gap-2"><MapPin aria-hidden="true" className="size-4 shrink-0" /><dd>{item.destination_city ? `${item.destination_city}/${item.destination_state}` : "Destino não informado"}</dd></div>
              </dl>
              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-3">
                <span data-list-column="trips:priority"><TripPriorityBadge priority={item.priority} /></span>
                <span data-list-column="trips:nextStep" className="min-w-0 flex-1 text-sm font-medium text-card-foreground">{tripNextStepLabels[item.status]}</span>
                <TripRowActions basePath={base} tripId={item.id} code={item.code} status={item.status} />
              </div>
            </MobileRecordCard>
          );
        })}
      </MobileRecordList>
    </>
  );
}
