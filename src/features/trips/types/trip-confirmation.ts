export type TripConfirmationCheckStatus = "ready" | "pending" | "problem";

export type TripConfirmationCheck = {
  code: string;
  title: string;
  status: TripConfirmationCheckStatus;
  message: string;
};

export type TripConfirmationReadiness = {
  ready: boolean;
  checks: TripConfirmationCheck[];
};

export type TripConfirmationReason =
  | "not_found"
  | "not_planned"
  | "main_data_incomplete"
  | "invalid_period"
  | "client_inactive"
  | "unit_inactive"
  | "service_type_inactive"
  | "team_required"
  | "responsible_required"
  | "skill_coverage_incomplete"
  | "technician_inactive"
  | "technician_unavailable"
  | "technician_schedule_conflict"
  | "transport_required"
  | "vehicle_unavailable"
  | "vehicle_schedule_conflict"
  | "capacity_insufficient"
  | "driver_not_allocated"
  | "driver_not_eligible"
  | "driver_license_invalid"
  | "overnights_missing"
  | "overnights_outdated"
  | "overnights_not_reviewed"
  | "unexpected";

export type TripConfirmationResult =
  | { success: true }
  | { success: false; reason: TripConfirmationReason };

export type TripConfirmationActionState = {
  status: "idle" | "success" | "error";
  message: string | null;
};
