export type TripVehicleAssignment = {
  id: string;
  vehicleId: string;
  plate: string;
  brand: string;
  model: string;
  passengerCapacity: number;
  vehicleBaseCity: string;
  vehicleBaseState: string;
  operationalStatus: "available" | "maintenance" | "blocked";
  vehicleActive: boolean;
  driverTechnicianId: string;
  driverName: string;
  driverActive: boolean;
  driverLicenseCategory: string | null;
  driverLicenseExpiresAt: string | null;
  notes: string | null;
  occupancyStartsAt: string | null;
  occupancyEndsAt: string | null;
  blocksSchedule: boolean;
};

export type VehicleAvailabilityReason =
  | "inactive"
  | "maintenance"
  | "blocked"
  | "unavailability"
  | "trip_conflict"
  | "capacity";

export type TripVehicleCandidate = {
  id: string;
  plate: string;
  brand: string;
  model: string;
  passengerCapacity: number;
  baseCity: string;
  baseState: string;
  group: "available" | "unavailable";
  unavailableReason: VehicleAvailabilityReason | null;
  currentlyAssigned: boolean;
};

export type DriverEligibilityReason =
  | "inactive"
  | "not_authorized"
  | "license_incomplete"
  | "license_expired"
  | "unavailability"
  | "trip_conflict";

export type TripDriverCandidate = {
  technicianId: string;
  name: string;
  isResponsible: boolean;
  canDriveCompanyVehicle: boolean;
  driverLicenseCategory: string | null;
  driverLicenseExpiresAt: string | null;
  group: "eligible" | "ineligible";
  ineligibleReason: DriverEligibilityReason | null;
  currentlyAssigned: boolean;
};

export type TripTransportSummary = {
  assignment: TripVehicleAssignment | null;
  vehicles: TripVehicleCandidate[];
  drivers: TripDriverCandidate[];
  teamSize: number;
  periodRequired: boolean;
  assignmentValid: boolean;
  assignmentIssues: string[];
};

export type TripTransportActionState = {
  status: "idle" | "success" | "error";
  message: string | null;
  fieldErrors?: Partial<Record<"vehicleId" | "driverTechnicianId" | "notes", string[]>>;
};

export type TripTransportMutationResult =
  | { success: true }
  | {
      success: false;
      reason:
        | "not_editable"
        | "period_required"
        | "team_required"
        | "vehicle_not_available"
        | "vehicle_unavailable"
        | "vehicle_schedule_conflict"
        | "capacity_exceeded"
        | "driver_not_allocated"
        | "driver_not_eligible"
        | "driver_license_expired"
        | "driver_unavailable"
        | "not_found"
        | "invalid"
        | "unexpected";
    };
