import type { TripPriority, TripStatus } from "@/features/trips/types/trip";

export type TechnicianOperationalTrip = {
  id: string;
  code: string;
  title: string;
  clientName: string;
  clientUnitName: string;
  destinationCity: string | null;
  destinationState: string | null;
  travelStartsAt: string | null;
  travelEndsAt: string | null;
  serviceStartsAt: string | null;
  serviceEndsAt: string | null;
  priority: TripPriority;
  status: TripStatus;
  isResponsible: boolean;
};
