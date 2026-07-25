import "server-only";

import type { TripMutationResult } from "@/features/trips/types/trip";

export function mapTripError(error: { code?: string; message: string }): Exclude<TripMutationResult, { success: true }> {
  const message = error.message;
  if (message.includes("trip_unit_not_available")) return { success: false, reason: "unit_not_available" };
  if (message.includes("trip_service_type_not_available")) return { success: false, reason: "service_type_not_available" };
  if (message.includes("trip_incomplete_for_planning") || message.includes("trips_planned_is_complete")) {
    return { success: false, reason: "incomplete_for_planning" };
  }
  if (message.includes("trip_period_required")) return { success: false, reason: "team_period_required" };
  if (message.includes("trip_transport_period_required")) return { success: false, reason: "team_period_required" };
  if (message.includes("trip_vehicle_not_available")) return { success: false, reason: "vehicle_not_available" };
  if (message.includes("trip_vehicle_unavailable")) return { success: false, reason: "vehicle_unavailable" };
  if (message.includes("trip_vehicle_schedule_conflict")) return { success: false, reason: "vehicle_schedule_conflict" };
  if (message.includes("trip_vehicle_capacity_exceeded")) return { success: false, reason: "vehicle_capacity_exceeded" };
  if (message.includes("trip_driver_not_allocated")) return { success: false, reason: "driver_not_allocated" };
  if (message.includes("trip_driver_not_eligible")) return { success: false, reason: "driver_not_eligible" };
  if (message.includes("trip_driver_license_expired")) return { success: false, reason: "driver_license_expired" };
  if (message.includes("trip_driver_unavailable")) return { success: false, reason: "driver_unavailable" };
  if (message.includes("period") || message.includes("service_within_travel")) {
    return { success: false, reason: "invalid_period" };
  }
  if (message.includes("trip_invalid_transition")) return { success: false, reason: "invalid_transition" };
  if (message.includes("trip_cancellation_reason_required")) return { success: false, reason: "cancellation_reason_required" };
  if (message.includes("trip_restore_forbidden")) return { success: false, reason: "restore_forbidden" };
  if (message.includes("trip_confirmed_restore_forbidden") || message.includes("trip_not_editable")) {
    return { success: false, reason: "invalid_transition" };
  }
  if (message.includes("trip_technician_not_available")) return { success: false, reason: "technician_not_available" };
  if (message.includes("trip_technician_unavailable")) return { success: false, reason: "technician_unavailable" };
  if (message.includes("trip_technician_schedule_conflict") || error.code === "23P01") {
    return { success: false, reason: "technician_schedule_conflict" };
  }
  return { success: false, reason: "unexpected" };
}
