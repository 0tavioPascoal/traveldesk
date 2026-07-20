import "server-only";

import type { UnavailabilityFormValues, UnavailabilityTypeFormValues } from "@/features/unavailabilities/types/unavailability";

function stringValue(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

export function readUnavailabilityTypeValues(formData: FormData): UnavailabilityTypeFormValues {
  return {
    name: stringValue(formData, "name"),
    description: stringValue(formData, "description"),
    active: formData.get("active") === "on",
  };
}

export function readUnavailabilityValues(formData: FormData): UnavailabilityFormValues {
  return {
    resourceId: stringValue(formData, "resourceId"),
    unavailabilityTypeId: stringValue(formData, "unavailabilityTypeId"),
    startsAt: stringValue(formData, "startsAt"),
    endsAt: stringValue(formData, "endsAt"),
    allDay: formData.get("allDay") === "on",
    reason: stringValue(formData, "reason"),
    notes: stringValue(formData, "notes"),
  };
}
