import "server-only";

import type { TripFormValues } from "@/features/trips/types/trip";

function text(formData: FormData, name: string) { const value = formData.get(name); return typeof value === "string" ? value : ""; }

export function readTripFormValues(formData: FormData): TripFormValues {
  return {
    clientId: text(formData, "clientId"), clientUnitId: text(formData, "clientUnitId"),
    serviceTypeId: text(formData, "serviceTypeId"), title: text(formData, "title"),
    reason: text(formData, "reason"), description: text(formData, "description"),
    priority: text(formData, "priority") as TripFormValues["priority"],
    travelStartsAt: text(formData, "travelStartsAt"), travelEndsAt: text(formData, "travelEndsAt"),
    serviceStartsAt: text(formData, "serviceStartsAt"), serviceEndsAt: text(formData, "serviceEndsAt"),
    originCity: text(formData, "originCity"), originState: text(formData, "originState"),
    destinationCity: text(formData, "destinationCity"), destinationState: text(formData, "destinationState"),
    notes: text(formData, "notes"),
  };
}
