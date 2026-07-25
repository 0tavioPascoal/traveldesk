import { InlineAlert } from "@/components/ui/inline-alert";
import { SectionHeader } from "@/components/page/section-header";
import type { TripDetails as Details } from "@/features/trips/types/trip";

function dateTime(value: string | null, timezone: string) {
  return value ? new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium", timeStyle: "short", timeZone: timezone }).format(new Date(value)) : "Não informado";
}

export function TripDetails({ trip, timezone }: { trip: Details; timezone: string }) {
  const groups = [
    {
      title: "Solicitação",
      rows: [["Tipo de atendimento", trip.serviceTypeName ?? "Não informado"], ["Motivo", trip.reason ?? "Não informado"]],
    },
    {
      title: "Cliente e rota",
      rows: [["Cliente", trip.client_name_snapshot], ["Unidade", trip.client_unit_name_snapshot], ["Origem", trip.origin_city ? `${trip.origin_city}/${trip.origin_state}` : "Não informada"], ["Destino", trip.destination_city ? `${trip.destination_city}/${trip.destination_state}` : "Não informado"]],
    },
    {
      title: "Períodos planejados",
      rows: [["Saída", dateTime(trip.travel_starts_at, timezone)], ["Retorno previsto", dateTime(trip.travel_ends_at, timezone)], ["Início do atendimento", dateTime(trip.service_starts_at, timezone)], ["Fim do atendimento", dateTime(trip.service_ends_at, timezone)]],
    },
    {
      title: "Auditoria",
      rows: [["Criada em", dateTime(trip.created_at, timezone)], ["Atualizada em", dateTime(trip.updated_at, timezone)], ...(trip.confirmed_at ? [["Confirmada em", dateTime(trip.confirmed_at, timezone)]] : []), ...(trip.finished_at ? [["Finalizada em", dateTime(trip.finished_at, timezone)]] : [])],
    },
  ];

  return (
    <div className="space-y-5">
      <SectionHeader title="Visão geral" description="Dados cadastrais, rota, períodos planejados e informações da solicitação." />
      <div className="grid gap-4 lg:grid-cols-2">
        {groups.map((group) => (
          <section key={group.title} className="rounded-xl border border-border bg-card p-5">
            <h2 className="font-semibold text-foreground">{group.title}</h2>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              {group.rows.map(([label, value]) => <div key={label}><dt className="text-xs font-medium uppercase tracking-wide text-subtle-foreground">{label}</dt><dd className="mt-1 text-sm font-medium text-foreground">{value}</dd></div>)}
            </dl>
          </section>
        ))}
      </div>
      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-5"><h2 className="font-semibold text-foreground">Descrição</h2><p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{trip.description || "Nenhuma descrição registrada."}</p></div>
        <div className="rounded-xl border border-border bg-card p-5"><h2 className="font-semibold text-foreground">Observações internas</h2><p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{trip.notes || "Nenhuma observação registrada."}</p></div>
      </section>
      {trip.status === "canceled" ? <InlineAlert tone="error"><div><p className="font-semibold">Viagem cancelada</p><p className="mt-1">{trip.cancellation_reason}</p><p className="mt-1 text-xs">Cancelada em {dateTime(trip.canceled_at, timezone)}</p></div></InlineAlert> : null}
    </div>
  );
}
