export type TechnicianLicenseState =
  | "not_authorized"
  | "incomplete"
  | "expired"
  | "valid";

export function getTechnicianLicenseState(
  technician: {
    can_drive_company_vehicle: boolean;
    driver_license_number?: string | null;
    driver_license_category?: string | null;
    driver_license_expires_at: string | null;
  },
  referenceDate: string,
): TechnicianLicenseState {
  if (!technician.can_drive_company_vehicle) return "not_authorized";
  if (
    !technician.driver_license_number ||
    !technician.driver_license_category ||
    !technician.driver_license_expires_at
  ) return "incomplete";
  return technician.driver_license_expires_at < referenceDate ? "expired" : "valid";
}

export function technicianLicenseLabel(state: TechnicianLicenseState) {
  const labels: Record<TechnicianLicenseState, string> = {
    not_authorized: "Não autorizado a dirigir",
    incomplete: "Dados da CNH incompletos",
    expired: "CNH vencida",
    valid: "CNH válida",
  };
  return labels[state];
}

export function formatDateOnly(value: string | null) {
  if (!value) return "Não informada";
  return new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(
    new Date(`${value}T00:00:00Z`),
  );
}

export function dateInTimezone(value: Date, timezone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(value);
  const get = (type: "year" | "month" | "day") =>
    parts.find((part) => part.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}
