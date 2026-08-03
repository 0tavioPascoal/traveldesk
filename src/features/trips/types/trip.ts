import type { Database, Tables } from "@/lib/supabase/database.types";

export type TripPriority = Database["public"]["Enums"]["trip_priority"];
export type TripStatus = Database["public"]["Enums"]["trip_status"];

export type TripFormValues = {
  clientId: string;
  clientUnitId: string;
  serviceTypeId: string;
  title: string;
  reason: string;
  description: string;
  priority: TripPriority;
  travelStartsAt: string;
  travelEndsAt: string;
  serviceStartsAt: string;
  serviceEndsAt: string;
  originCity: string;
  originState: string;
  destinationCity: string;
  destinationState: string;
  notes: string;
};

export type TripFieldErrors = Partial<Record<keyof TripFormValues, string[]>>;
export type TripActionState = {
  status: "idle" | "error";
  message: string | null;
  fieldErrors: TripFieldErrors;
  values: TripFormValues;
};
export type TripQuickActionState = {
  status: "idle" | "error" | "success";
  message: string | null;
};

export type TripFilters = {
  query: string;
  status: "all" | TripStatus;
  priority: "all" | TripPriority;
  startsOn: string;
  endsOn: string;
  page: number;
  pageSize: number;
};

export type TripListItem = Pick<
  Tables<"trips">,
  | "id" | "code" | "title" | "client_name_snapshot"
  | "client_unit_name_snapshot" | "destination_city" | "destination_state"
  | "travel_starts_at" | "travel_ends_at" | "priority" | "status" | "updated_at"
> & { serviceTypeName: string | null };

export type TripListResult = {
  items: TripListItem[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type TripDetails = Tables<"trips"> & { serviceTypeName: string | null };

export type TripClientOption = {
  id: string;
  legalName: string;
  tradeName: string | null;
  active: boolean;
};
export type TripUnitOption = {
  id: string;
  clientId: string;
  name: string;
  city: string;
  state: string;
  active: boolean;
};
export type TripServiceTypeOption = { id: string; name: string; active: boolean };
export type TripFormOptions = {
  clients: TripClientOption[];
  units: TripUnitOption[];
  serviceTypes: TripServiceTypeOption[];
};

export type TripMutationResult =
  | { success: true; tripId: string }
  | {
      success: false;
      reason:
        | "client_not_available"
        | "unit_not_available"
        | "service_type_not_available"
        | "invalid_period"
        | "incomplete_for_planning"
        | "invalid_transition"
        | "cancellation_reason_required"
        | "restore_forbidden"
        | "technician_not_available"
        | "technician_unavailable"
        | "technician_schedule_conflict"
        | "team_period_required"
        | "vehicle_not_available"
        | "vehicle_unavailable"
        | "vehicle_schedule_conflict"
        | "vehicle_capacity_exceeded"
        | "driver_not_allocated"
        | "driver_not_eligible"
        | "driver_license_expired"
        | "driver_unavailable"
        | "not_found"
        | "unexpected";
    };
