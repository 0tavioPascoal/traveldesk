import type { TripPriority, TripStatus } from "@/features/trips/types/trip";

export type DashboardPeriod = "today" | "week" | "next7" | "next30";

export type DashboardFilters = {
  period: DashboardPeriod;
  status: "all" | TripStatus;
  priority: "all" | TripPriority;
};

export type DashboardTrip = {
  id: string;
  code: string;
  title: string;
  clientName: string;
  unitName: string;
  startsAt: string;
  endsAt: string;
  status: TripStatus;
  priority: TripPriority;
  technicianNames: string[];
  href: string;
};

export type DashboardDayPoint = {
  date: string;
  weekday: string;
  dateLabel: string;
  count: number;
};

export type DashboardStatusPoint = {
  key: "planning" | "confirmed" | "execution" | "finished" | "canceled";
  label: string;
  count: number;
  percentage: number;
  tone: "neutral" | "info" | "primary" | "success" | "danger";
};

export type DashboardPriorityPoint = {
  key: TripPriority;
  label: string;
  count: number;
  percentage: number;
  tone: "muted" | "info" | "warning" | "danger";
};

export type DashboardResourcePoint = {
  key: "technicians" | "vehicles";
  label: string;
  totalActive: number;
  allocated: number;
  unavailable: number;
  allocationPercentage: number;
  unavailabilityPercentage: number;
};

export type DashboardTechnicianAllocation = {
  id: string;
  name: string;
  active: boolean;
  tripCount: number;
  allocatedHours: number;
  relativeLoad: number;
  href: string;
};

export type DashboardAlert = {
  id: string;
  title: string;
  description: string;
  count: number;
  level: "critical" | "warning" | "info";
  href: string;
};

export type OperationalDashboardData = {
  timezone: string;
  generatedAt: string;
  limited: boolean;
  hasOperationalData: boolean;
  filters: DashboardFilters;
  period: {
    startsAt: string;
    endsAt: string;
    startDate: string;
    endDate: string;
    label: string;
  };
  metrics: {
    trips: number;
    allocatedTechnicians: number;
    conflicts: number;
    occupiedVehicles: number;
    finishedTrips: number;
  };
  tripsByDay: DashboardDayPoint[];
  tripsByStatus: DashboardStatusPoint[];
  tripsByPriority: DashboardPriorityPoint[];
  resources: DashboardResourcePoint[];
  upcomingTrips: DashboardTrip[];
  topTechnicians: DashboardTechnicianAllocation[];
  alerts: DashboardAlert[];
};
