import type { TripPriority, TripStatus } from "@/features/trips/types/trip";

export type ScheduleFilters = {
  week: string;
  query: string;
  status: "all" | TripStatus;
  technicianId: string;
  vehicleId: string;
  showConflicts: boolean;
  showUnavailabilities: boolean;
};

export type ScheduleResourceOption = {
  id: string;
  label: string;
  active: boolean;
};

export type ScheduleTripEvent = {
  id: string;
  type: "trip";
  startsAt: string;
  endsAt: string;
  code: string;
  title: string;
  status: TripStatus;
  priority: TripPriority;
  clientName: string;
  unitName: string;
  description: string | null;
  notes: string | null;
  serviceStartsAt: string | null;
  serviceEndsAt: string | null;
  technicianIds: string[];
  technicianNames: string[];
  responsibleName: string | null;
  vehicleId: string | null;
  vehicleLabel: string | null;
  driverName: string | null;
  requiredSkills: string[];
  overnights: number | null;
  conflictLabels: string[];
  pendingLabels: string[];
  href: string;
};

export type ScheduleUnavailabilityEvent = {
  id: string;
  type: "technician_unavailability" | "vehicle_unavailability";
  startsAt: string;
  endsAt: string;
  allDay: boolean;
  resourceId: string;
  resourceName: string;
  typeName: string;
  reason: string | null;
};

export type ScheduleEvent =
  | ScheduleTripEvent
  | ScheduleUnavailabilityEvent;

export type ScheduleMetric = {
  label: string;
  value: number;
  tone: "primary" | "info" | "warning" | "danger";
};

export type WeeklyScheduleData = {
  timezone: string;
  generatedAt: string;
  limited: boolean;
  weekStart: string;
  weekEnd: string;
  filters: ScheduleFilters;
  events: ScheduleEvent[];
  technicians: ScheduleResourceOption[];
  vehicles: ScheduleResourceOption[];
  metrics: {
    trips: number;
    allocatedTechnicians: number;
    conflicts: number;
    occupiedVehicles: number;
  };
};

export type ScheduleDay = {
  key: string;
  shortLabel: string;
  dateLabel: string;
  longLabel: string;
  isToday: boolean;
  isWeekend: boolean;
};

export type ScheduleEventSegment = {
  segmentId: string;
  event: ScheduleEvent;
  dayKey: string;
  startsAt: string;
  endsAt: string;
  startMinute: number;
  endMinute: number;
  allDay: boolean;
  continuesBefore: boolean;
  continuesAfter: boolean;
  lane: number;
  laneCount: number;
};

export type ScheduleCalendarLayout = {
  days: ScheduleDay[];
  segments: ScheduleEventSegment[];
  startHour: number;
  endHour: number;
  currentDayKey: string | null;
  currentMinute: number | null;
};
