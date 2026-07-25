import { Badge } from "@/components/ui/badge";
import type { VehicleAvailabilityReason } from "@/features/trips/types/trip-transport";

const labels: Record<VehicleAvailabilityReason, string> = {
  inactive: "Inativo",
  maintenance: "Em manutenção",
  blocked: "Bloqueado",
  unavailability: "Indisponível no período",
  trip_conflict: "Reservado em outra viagem",
  capacity: "Capacidade insuficiente",
};

export function VehicleAvailabilityBadge({ reason }: { reason: VehicleAvailabilityReason | null }) {
  return <Badge tone={reason ? "warning" : "success"}>{reason ? labels[reason] : "Disponível"}</Badge>;
}
