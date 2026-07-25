import type { TripStatus } from "@/features/trips/types/trip";

export type TripOperationalStatus =
  | "traveling"
  | "at_client"
  | "in_service"
  | "returning"
  | "finished";

export type TripStatusHistoryItem = {
  id: string;
  fromStatus: TripStatus;
  toStatus: TripStatus;
  occurredAt: string;
  changedBy: string;
  changedByName: string;
  note: string | null;
};

export type TripExecutionSummary = {
  currentStatus: TripStatus;
  nextStatus: TripOperationalStatus | null;
  canTransition: boolean;
  transitionLabel: string | null;
  latestTransitionAt: string | null;
  history: TripStatusHistoryItem[];
};

export type TripExecutionActionState = {
  status: "idle" | "success" | "error";
  message: string | null;
};

export type TripExecutionResult =
  | { success: true }
  | {
      success: false;
      reason:
        | "not_found"
        | "not_authorized"
        | "invalid_transition"
        | "status_changed"
        | "already_finished"
        | "canceled"
        | "note_invalid"
        | "unexpected";
    };
