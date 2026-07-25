"use server";

import { revalidatePath } from "next/cache";

import { tripStaffingMessage } from "@/features/trips/application/map-trip-staffing-error";
import { replaceTripTechnicians } from "@/features/trips/application/replace-trip-technicians";
import { tripTechniciansSchema } from "@/features/trips/schemas/trip-technicians-schema";
import type { TripStaffingActionState } from "@/features/trips/types/trip-staffing";

function parseJson(value: FormDataEntryValue | null): unknown {
  if (typeof value !== "string") return null;
  try { return JSON.parse(value) as unknown; } catch { return null; }
}

export async function saveTripTeamAction(
  organizationSlug: string,
  tripId: string,
  previous: TripStaffingActionState,
  formData: FormData,
): Promise<TripStaffingActionState> {
  void previous;
  const parsed = await tripTechniciansSchema.safeParseAsync({
    tripId,
    technicians: parseJson(formData.get("technicians")),
  });
  if (!parsed.success) return { status: "error", message: "Revise a equipe técnica." };
  const result = await replaceTripTechnicians(organizationSlug, parsed.data);
  if (!result.success) return { status: "error", message: tripStaffingMessage(result.reason) };
  const base = `/app/${organizationSlug}/planejamento/viagens`;
  revalidatePath(base);
  revalidatePath(`${base}/${tripId}`);
  return { status: "success", message: "Equipe técnica atualizada." };
}
