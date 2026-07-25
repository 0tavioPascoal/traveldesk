import type { TripListItem } from "@/features/trips/types/trip";

export type OperationalDashboardData = {
  referenceTime: string;
  referenceDate: string;
  timezone: string;
  metrics: {
    tripsToday: number;
    inExecution: number;
    planned: number;
    drafts: number;
    confirmed: number;
    urgentOpen: number;
  };
  resources: {
    activeTechnicians: number;
    unavailableTechnicians: number;
    availableVehicles: number;
    unavailableVehicles: number;
    expiredDriverLicenses: number;
  };
  activeTrips: TripListItem[];
  upcomingTrips: TripListItem[];
};
