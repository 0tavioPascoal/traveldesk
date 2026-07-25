import { PriorityBadge, StatusBadge } from "@/components/ui/semantic-badges";
import type { TripPriority, TripStatus } from "@/features/trips/types/trip";

export function TripStatusBadge({ status }: { status: TripStatus }) {
  const config = {
    draft: ["Rascunho", "neutral"],
    planned: ["Planejada", "info"],
    confirmed: ["Confirmada", "success"],
    traveling: ["Em deslocamento", "info"],
    at_client: ["No cliente", "primary"],
    in_service: ["Em atendimento", "warning"],
    returning: ["Em retorno", "primary"],
    finished: ["Finalizada", "neutral"],
    canceled: ["Cancelada", "danger"],
  } as const;
  return <StatusBadge label={config[status][0]} tone={config[status][1]} />;
}

export function TripPriorityBadge({ priority }: { priority: TripPriority }) {
  const config = {
    low: ["Baixa", "neutral"],
    normal: ["Normal", "info"],
    high: ["Alta", "warning"],
    urgent: ["Urgente", "danger"],
  } as const;
  return <PriorityBadge label={config[priority][0]} tone={config[priority][1]} />;
}
