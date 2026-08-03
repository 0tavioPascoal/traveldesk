"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { revalidateSchedule } from "@/features/schedule/application/revalidate-schedule";
import { changeTechnicianStatus } from "@/features/technicians/application/change-technician-status";
import type { TechnicianStatusActionState } from "@/features/technicians/types/technician";

export async function changeTechnicianStatusAction(
  organizationSlug: string,
  technicianId: string,
  active: boolean,
  _previousState: TechnicianStatusActionState,
  _formData: FormData,
): Promise<TechnicianStatusActionState> {
  void _previousState;
  void _formData;
  const validation = z.object({ id: z.uuid(), active: z.boolean() }).safeParse({ id: technicianId, active });
  if (!validation.success) return { status: "error", message: "Não foi possível identificar o técnico." };
  const result = await changeTechnicianStatus(organizationSlug, technicianId, active);
  if (!result.success) return { status: "error", message: result.reason === "not_found" ? "O técnico não foi encontrado." : "Não foi possível alterar o status do técnico." };
  const listPath = `/app/${organizationSlug}/cadastros/tecnicos`;
  revalidatePath(listPath);
  revalidatePath(`${listPath}/${technicianId}`);
  revalidateSchedule(organizationSlug);
  return { status: "success", message: active ? "Técnico ativado com sucesso." : "Técnico inativado com sucesso." };
}
