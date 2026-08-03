"use server";

import { revalidatePath } from "next/cache";

import { revalidateSchedule } from "@/features/schedule/application/revalidate-schedule";
import { tripStaffingMessage } from "@/features/trips/application/map-trip-staffing-error";
import { replaceTripRequiredSkills } from "@/features/trips/application/replace-trip-required-skills";
import { tripRequiredSkillsSchema } from "@/features/trips/schemas/trip-required-skills-schema";
import type { TripStaffingActionState } from "@/features/trips/types/trip-staffing";

function parseJson(value: FormDataEntryValue | null): unknown {
  if (typeof value !== "string") return null;
  try { return JSON.parse(value) as unknown; } catch { return null; }
}

export async function saveTripRequiredSkillsAction(
  organizationSlug: string,
  tripId: string,
  previous: TripStaffingActionState,
  formData: FormData,
): Promise<TripStaffingActionState> {
  void previous;
  const parsed = await tripRequiredSkillsSchema.safeParseAsync({
    tripId,
    requirements: parseJson(formData.get("requirements")),
  });
  if (!parsed.success) return { status: "error", message: "Revise os requisitos técnicos." };
  const result = await replaceTripRequiredSkills(organizationSlug, parsed.data);
  if (!result.success) return { status: "error", message: tripStaffingMessage(result.reason) };
  const base = `/app/${organizationSlug}/planejamento/viagens`;
  revalidatePath(base);
  revalidatePath(`${base}/${tripId}`);
  revalidateSchedule(organizationSlug);
  return { status: "success", message: "Requisitos técnicos atualizados." };
}
