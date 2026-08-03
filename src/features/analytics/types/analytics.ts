import type { TripPriority, TripStatus } from "@/features/trips/types/trip";

export type AnalyticsPeriod =
  | "today"
  | "week"
  | "last7"
  | "last30"
  | "last90"
  | "custom";

export type AnalyticsFilters = {
  period: AnalyticsPeriod;
  startDate: string;
  endDate: string;
  clientId: "all" | string;
  unitId: "all" | string;
  status: "all" | TripStatus;
  priority: "all" | TripPriority;
  technicianId: "all" | string;
  vehicleId: "all" | string;
  serviceTypeId: "all" | string;
};

export type AnalyticsOption = {
  id: string;
  label: string;
};

export type AnalyticsUnitOption = AnalyticsOption & {
  clientId: string;
};

export type AnalyticsOptions = {
  clients: AnalyticsOption[];
  units: AnalyticsUnitOption[];
  technicians: AnalyticsOption[];
  vehicles: AnalyticsOption[];
  serviceTypes: AnalyticsOption[];
};

export type AnalyticsTimePoint = {
  key: string;
  label: string;
  tooltipLabel: string;
  startsAt: string;
  endsAt: string;
  value: number;
};

export type AnalyticsChartPoint = {
  key: string;
  label: string;
  value: number;
};

export type AnalyticsStatusPoint = AnalyticsChartPoint & {
  percentage: number;
  tone: "neutral" | "info" | "primary" | "success" | "danger";
};

export type AnalyticsPriorityPoint = AnalyticsChartPoint & {
  tone: "muted" | "info" | "warning" | "danger";
};

export type AnalyticsResourcePoint = {
  key: "technicians" | "vehicles";
  label: string;
  active: number;
  used: number;
};

export type AnalyticsData = {
  timezone: string;
  limited: boolean;
  filters: AnalyticsFilters;
  options: AnalyticsOptions;
  period: {
    startsAt: string;
    endsAt: string;
    startDate: string;
    endDate: string;
    label: string;
    granularity: "hour" | "day" | "week" | "month";
  };
  tripsByPeriod: AnalyticsTimePoint[];
  tripsByStatus: AnalyticsStatusPoint[];
  tripsByClient: AnalyticsChartPoint[];
  tripsByServiceType: AnalyticsChartPoint[];
  tripsByPriority: AnalyticsPriorityPoint[];
  resourceUsage: AnalyticsResourcePoint[];
  tripsByTechnician: AnalyticsChartPoint[];
  tripsByVehicle: AnalyticsChartPoint[];
  totalTrips: number;
};
