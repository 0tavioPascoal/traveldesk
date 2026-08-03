import type { Tables } from "@/lib/supabase/database.types";

export type UnavailabilityResourceKind = "technicians" | "vehicles";
export type UnavailabilityResourceFilter = "all" | UnavailabilityResourceKind;
export type UnavailabilityStatusFilter = "all" | "active" | "inactive";
export type UnavailabilityTemporalFilter = "all" | "current" | "future" | "past";

export type UnavailabilityTypeItem = Pick<
  Tables<"technician_unavailability_types">,
  "id" | "name" | "description" | "active" | "updated_at"
>;

export type UnavailabilityTypeOption = Pick<
  UnavailabilityTypeItem,
  "id" | "name" | "active"
>;

export type UnavailabilityTypeFilters = {
  query: string;
  status: UnavailabilityStatusFilter;
};

export type UnavailabilityTypeFormValues = {
  name: string;
  description: string;
  active: boolean;
};

export type UnavailabilityFormValues = {
  resourceId: string;
  unavailabilityTypeId: string;
  startsAt: string;
  endsAt: string;
  allDay: boolean;
  reason: string;
  notes: string;
};

export type UnavailabilityFilters = {
  resource: UnavailabilityResourceFilter;
  query: string;
  startsOn: string;
  endsOn: string;
  resourceId: string;
  unavailabilityTypeId: string;
  temporalStatus: UnavailabilityTemporalFilter;
  status: UnavailabilityStatusFilter;
  page: number;
  pageSize: number;
};

export type UnavailabilityListItem = {
  id: string;
  resourceId: string;
  resourceName: string;
  resourceDescription: string | null;
  typeId: string;
  typeName: string;
  startsAt: string;
  endsAt: string;
  allDay: boolean;
  reason: string | null;
  active: boolean;
  updatedAt: string;
};

export type CentralUnavailabilityListItem = UnavailabilityListItem & {
  resourceKind: UnavailabilityResourceKind;
};

export type UnavailabilityDetails = UnavailabilityListItem & {
  notes: string | null;
};

export type AvailabilityConflict = Pick<
  UnavailabilityListItem,
  "id" | "typeName" | "startsAt" | "endsAt"
>;

export type AvailabilityResult = {
  available: boolean;
  conflicts: AvailabilityConflict[];
};

export type UnavailabilityFieldErrors = Partial<
  Record<keyof UnavailabilityFormValues, string[]>
>;

export type UnavailabilityTypeFieldErrors = Partial<
  Record<keyof UnavailabilityTypeFormValues, string[]>
>;

export type UnavailabilityActionState = {
  status: "idle" | "error";
  message: string | null;
  fieldErrors: UnavailabilityFieldErrors;
  values: UnavailabilityFormValues;
};

export type UnavailabilityTypeActionState = {
  status: "idle" | "error";
  message: string | null;
  fieldErrors: UnavailabilityTypeFieldErrors;
  values: UnavailabilityTypeFormValues;
};

export type UnavailabilityQuickActionState = {
  status: "idle" | "error" | "success";
  message: string | null;
};

export type UnavailabilityMutationResult =
  | { success: true; id: string }
  | {
      success: false;
      reason:
        | "duplicate_name"
        | "overlap"
        | "resource_not_available"
        | "type_not_available"
        | "past_edit_forbidden"
        | "not_found"
        | "invalid_period"
        | "trip_conflict"
        | "vehicle_trip_conflict"
        | "unexpected";
    };
