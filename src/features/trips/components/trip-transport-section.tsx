import { SectionHeader } from "@/components/page/section-header";
import { TripTransportEditor } from "@/features/trips/components/trip-transport-editor";
import type { TripStatus } from "@/features/trips/types/trip";
import type { TripTransportSummary } from "@/features/trips/types/trip-transport";

export function TripTransportSection({ organizationSlug, tripId, status, summary, timezone }: {
  organizationSlug: string;
  tripId: string;
  status: TripStatus;
  summary: TripTransportSummary;
  timezone: string;
}) {
  const editable = status === "draft" || status === "planned";
  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <SectionHeader title="Transporte" description="Veículo reservado, capacidade e motorista definido para a viagem." />
      {!editable ? <p className="mt-4 rounded-lg bg-surface-muted p-3 text-sm text-muted-foreground">O transporte permanece somente para consulta após a confirmação ou encerramento da viagem.</p> : null}
      <div className="mt-5">
        <TripTransportEditor organizationSlug={organizationSlug} tripId={tripId} summary={summary} editable={editable} timezone={timezone} />
      </div>
    </section>
  );
}
