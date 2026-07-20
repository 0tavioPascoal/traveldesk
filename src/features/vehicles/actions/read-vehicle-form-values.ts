import "server-only";

import type { VehicleFormValues, VehicleOperationalStatus } from "@/features/vehicles/types/vehicle";

export function readVehicleFormValues(formData: FormData): VehicleFormValues {
  const value = (name: keyof VehicleFormValues) => {
    const field = formData.get(name);
    return typeof field === "string" ? field : "";
  };
  return {
    plate: value("plate"),
    brand: value("brand"),
    model: value("model"),
    manufactureYear: value("manufactureYear"),
    modelYear: value("modelYear"),
    passengerCapacity: value("passengerCapacity"),
    baseCity: value("baseCity"),
    baseState: value("baseState"),
    currentMileage: value("currentMileage"),
    operationalStatus: value("operationalStatus") as VehicleOperationalStatus,
    licensingExpiresAt: value("licensingExpiresAt"),
    maintenanceDueAt: value("maintenanceDueAt"),
    notes: value("notes"),
  };
}
