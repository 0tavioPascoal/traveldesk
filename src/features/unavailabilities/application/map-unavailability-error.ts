import "server-only";

import type { UnavailabilityMutationResult } from "@/features/unavailabilities/types/unavailability";

type DatabaseError = { code?: string; message: string };

export function mapUnavailabilityError(
  error: DatabaseError,
): Extract<UnavailabilityMutationResult, { success: false }> {
  if (error.code === "23P01") return { success: false, reason: "overlap" };
  if (error.message.includes("unavailability_resource_not_available")) {
    return { success: false, reason: "resource_not_available" };
  }
  if (error.message.includes("unavailability_type_not_available")) {
    return { success: false, reason: "type_not_available" };
  }
  if (error.message.includes("past_unavailability_edit_forbidden")) {
    return { success: false, reason: "past_edit_forbidden" };
  }
  if (error.message.includes("invalid_all_day_period") || error.code === "23514") {
    return { success: false, reason: "invalid_period" };
  }
  return { success: false, reason: "unexpected" };
}
