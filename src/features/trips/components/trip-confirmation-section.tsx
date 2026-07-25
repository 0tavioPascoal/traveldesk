import { Badge } from "@/components/ui/badge";
import { InlineAlert } from "@/components/ui/inline-alert";
import { SectionHeader } from "@/components/page/section-header";
import type { TripConfirmationReadiness } from "@/features/trips/types/trip-confirmation";

const checkTone = { ready: "success", pending: "warning", problem: "danger" } as const;
const checkLabel = { ready: "Pronto", pending: "Pendente", problem: "Com problema" } as const;

export function TripConfirmationSection({ readiness, confirmedAt, timezone }: {
  readiness: TripConfirmationReadiness | null;
  confirmedAt: string | null;
  timezone: string;
}) {
  if (!readiness && !confirmedAt) return null;
  if (!readiness && confirmedAt) {
    const confirmedDate = new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium", timeStyle: "short", timeZone: timezone }).format(new Date(confirmedAt));
    return (
      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <SectionHeader title="Confirmação" description="Registro da validação que tornou a viagem uma programação operacional." />
        <div className="mt-5"><InlineAlert tone="success"><div><p className="font-semibold">Viagem confirmada</p><p className="mt-1">Confirmada em {confirmedDate}. O responsável pela transição pode ser consultado no histórico de status.</p></div></InlineAlert></div>
      </section>
    );
  }
  if (!readiness) return null;
  return (
    <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
      <SectionHeader title="Prontidão para confirmação" description="A confirmação revalidará todos os itens novamente dentro de uma única transação." />
      <div className="mt-5"><InlineAlert tone={readiness.ready ? "success" : "warning"}>{readiness.ready ? "Todos os critérios estão prontos. Use a ação principal no cabeçalho para confirmar a viagem." : "Resolva as pendências abaixo antes de confirmar a viagem."}</InlineAlert></div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {readiness.checks.map((item) => (
          <article key={item.code} className="rounded-xl border border-border bg-surface-muted/35 p-4">
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-sm font-semibold">{item.title}</h3>
              <Badge tone={checkTone[item.status]}>{checkLabel[item.status]}</Badge>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{item.message}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
