import "server-only";

import { listTripStatusHistory } from "@/features/trips/queries/list-trip-status-history";
import type { TripExecutionSummary, TripOperationalStatus } from "@/features/trips/types/trip-execution";
import type { TripStatus } from "@/features/trips/types/trip";

const transitions: Partial<Record<TripStatus, { status: TripOperationalStatus; label: string }>> = {
  confirmed: { status: "traveling", label: "Iniciar deslocamento" },
  traveling: { status: "at_client", label: "Registrar chegada" },
  at_client: { status: "in_service", label: "Iniciar atendimento" },
  in_service: { status: "returning", label: "Iniciar retorno" },
  returning: { status: "finished", label: "Finalizar viagem" },
};

export async function getTripExecutionSummary(
  organizationSlug: string,
  tripId: string,
  currentStatus: TripStatus,
): Promise<TripExecutionSummary> {
  const history = await listTripStatusHistory(organizationSlug, tripId);
  const next = transitions[currentStatus] ?? null;
  return {
    currentStatus,
    nextStatus: next?.status ?? null,
    canTransition: next !== null,
    transitionLabel: next?.label ?? null,
    latestTransitionAt: history.at(-1)?.occurredAt ?? null,
    history,
  };
}
