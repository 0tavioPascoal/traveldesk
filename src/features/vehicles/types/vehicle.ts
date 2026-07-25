import type { Database, Tables } from "@/lib/supabase/database.types";

export type VehicleOperationalStatus =
  Database["public"]["Enums"]["vehicle_operational_status"];

export type Vehicle = Pick<
  Tables<"vehicles">,
  | "id"
  | "plate"
  | "brand"
  | "model"
  | "manufacture_year"
  | "model_year"
  | "passenger_capacity"
  | "base_city"
  | "base_state"
  | "current_mileage"
  | "operational_status"
  | "licensing_expires_at"
  | "maintenance_due_at"
  | "notes"
  | "active"
  | "updated_at"
>;

export type VehicleListItem = Omit<Vehicle, "notes">;

export type VehicleUnavailabilityPeriod = {
  id: string;
  typeName: string;
  startsAt: string;
  endsAt: string;
  allDay: boolean;
  reason: string | null;
};

export type VehicleReservation = {
  tripId: string;
  code: string;
  title: string;
  clientName: string;
  status: Database["public"]["Enums"]["trip_status"];
  startsAt: string;
  endsAt: string;
};

export type VehicleOperationalPeriods = {
  unavailabilities: VehicleUnavailabilityPeriod[];
  reservations: VehicleReservation[];
};

export type VehicleAvailabilitySummary = {
  kind: "unavailability_current" | "unavailability_future" | "reservation_current" | "reservation_future";
  startsAt: string;
  endsAt: string;
};

export type VehicleListViewItem = VehicleListItem & {
  availability: VehicleAvailabilitySummary | null;
};

export type ActiveVehicle = Pick<
  Vehicle,
  "id" | "plate" | "brand" | "model" | "operational_status"
>;

export type AvailableVehicle = Pick<
  Vehicle,
  "id" | "plate" | "brand" | "model" | "passenger_capacity" | "base_city" | "base_state"
>;

export type VehicleFilters = {
  query: string;
  activeState: "all" | "active" | "inactive";
  operationalStatus: "all" | VehicleOperationalStatus;
  baseState: string;
  minimumCapacity: string;
  page: number;
};

export type VehicleListResult = {
  items: VehicleListViewItem[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type VehicleFormValues = {
  plate: string;
  brand: string;
  model: string;
  manufactureYear: string;
  modelYear: string;
  passengerCapacity: string;
  baseCity: string;
  baseState: string;
  currentMileage: string;
  operationalStatus: VehicleOperationalStatus;
  licensingExpiresAt: string;
  maintenanceDueAt: string;
  notes: string;
};

export type VehicleFieldErrors = Partial<
  Record<keyof VehicleFormValues, string[]>
>;

export type VehicleActionState = {
  status: "idle" | "error";
  fieldErrors: VehicleFieldErrors;
  message: string | null;
  values: VehicleFormValues;
};

export type VehicleQuickActionState = {
  status: "idle" | "error" | "success";
  message: string | null;
};

export type VehicleMutationResult =
  | { success: true; vehicleId: string }
  | {
      success: false;
      reason:
        | "duplicate_plate"
        | "mileage_reduction_forbidden"
        | "not_found"
        | "unexpected";
    };
