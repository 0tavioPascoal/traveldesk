export type TripOvernightSummary = {
  calculatedOvernights: number | null;
  adjustedOvernights: number | null;
  effectiveOvernights: number | null;
  technicianCount: number;
  estimatedPersonOvernights: number | null;
  isAdjusted: boolean;
  isReviewed: boolean;
  isOutdated: boolean;
  overnightsReadyForConfirmation: boolean;
  adjustmentReason: string | null;
  calculationTimezone: string | null;
  calculatedForTravelStartsAt: string | null;
  calculatedForTravelEndsAt: string | null;
  reviewedAt: string | null;
  adjustedAt: string | null;
  revision: number | null;
  periodValid: boolean;
};

export type TripOvernightMutationReason =
  | "not_editable"
  | "period_required"
  | "invalid_timezone"
  | "not_calculated"
  | "stale"
  | "invalid_adjustment"
  | "adjustment_reason_required"
  | "not_found"
  | "unexpected";

export type TripOvernightMutationResult =
  | { success: true }
  | { success: false; reason: TripOvernightMutationReason };

export type TripOvernightActionState = {
  status: "idle" | "success" | "error";
  message: string | null;
  fieldErrors?: Partial<Record<"adjustedOvernights" | "adjustmentReason", string[]>>;
  values?: { adjustedOvernights: string; adjustmentReason: string };
};
