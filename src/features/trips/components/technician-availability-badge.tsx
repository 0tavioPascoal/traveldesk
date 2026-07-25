import { Badge } from "@/components/ui/badge";
import type { TechnicianAvailabilityReason } from "@/features/trips/types/trip-staffing";

export function TechnicianAvailabilityBadge({ reason }: { reason: TechnicianAvailabilityReason | null }) {
  if (!reason) return <Badge tone="success">Disponível</Badge>;
  return (
    <Badge tone="danger">
      {reason === "trip_conflict" ? "Conflito com outra viagem" : "Indisponível no período"}
    </Badge>
  );
}
