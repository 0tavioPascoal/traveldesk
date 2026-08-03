import { PriorityBadge, StatusBadge } from "@/components/ui/semantic-badges";
import type { TripPriority, TripStatus } from "@/features/trips/types/trip";

export const tripStatusPresentation = {
  draft: { label: "Rascunho", tone: "neutral" },
  planned: { label: "Planejada", tone: "info" },
  confirmed: { label: "Confirmada", tone: "success" },
  traveling: { label: "Em deslocamento", tone: "info" },
  at_client: { label: "No cliente", tone: "primary" },
  in_service: { label: "Em atendimento", tone: "warning" },
  returning: { label: "Em retorno", tone: "primary" },
  finished: { label: "Finalizada", tone: "neutral" },
  canceled: { label: "Cancelada", tone: "danger" },
} as const satisfies Record<TripStatus, {
  label: string;
  tone: "neutral" | "primary" | "info" | "success" | "warning" | "danger";
}>;

export function TripStatusBadge({ status }: { status: TripStatus }) {
  const presentation = tripStatusPresentation[status];
  return <StatusBadge label={presentation.label} tone={presentation.tone} />;
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
