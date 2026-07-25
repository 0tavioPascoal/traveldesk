import type { VehicleOperationalStatus } from "@/features/vehicles/types/vehicle";

export type VehicleDateState = "not_informed" | "expired" | "due_soon" | "valid";

export function formatVehiclePlate(value: string) {
  return value.replace(/^([A-Z]{3})([0-9]{4})$/, "$1-$2");
}

export function vehicleOperationalLabel(status: VehicleOperationalStatus) {
  return { available: "Disponível", maintenance: "Em manutenção", blocked: "Bloqueado" }[status];
}

export function formatDateOnly(value: string | null) {
  if (!value) return "Não informado";
  return new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`));
}

export function getVehicleDateState(value: string | null, referenceDate: string): VehicleDateState {
  if (!value) return "not_informed";
  if (value < referenceDate) return "expired";
  const target = new Date(`${value}T00:00:00Z`).getTime();
  const reference = new Date(`${referenceDate}T00:00:00Z`).getTime();
  return target - reference <= 30 * 86400000 ? "due_soon" : "valid";
}

export function dateInTimezone(value: Date, timezone: string) {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(value);
  const get = (type: "year" | "month" | "day") => parts.find((part) => part.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}
