import { Badge } from "@/components/ui/badge";
import { vehicleOperationalLabel, type VehicleDateState } from "@/features/vehicles/application/vehicle-presentation";
import type { VehicleOperationalStatus } from "@/features/vehicles/types/vehicle";

export function VehicleOperationalBadge({ status }: { status: VehicleOperationalStatus }) {
  const tones = { available: "success", maintenance: "warning", blocked: "danger" } as const;
  return <Badge tone={tones[status]}>{vehicleOperationalLabel(status)}</Badge>;
}

export function VehicleDateBadge({ state, subject }: { state: VehicleDateState; subject: "Licenciamento" | "Manutenção" }) {
  const config = {
    not_informed: [`${subject} não informado`, "neutral"],
    expired: [subject === "Licenciamento" ? "Licenciamento vencido" : "Manutenção vencida", "danger"],
    due_soon: [subject === "Licenciamento" ? "Licenciamento próximo" : "Manutenção próxima", "warning"],
    valid: [subject === "Licenciamento" ? "Licenciamento válido" : "Manutenção em dia", "success"],
  } as const;
  return <Badge tone={config[state][1]}>{config[state][0]}</Badge>;
}
