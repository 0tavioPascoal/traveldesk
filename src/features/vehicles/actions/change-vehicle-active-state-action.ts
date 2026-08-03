"use server";

import { revalidatePath } from "next/cache";

import { revalidateSchedule } from "@/features/schedule/application/revalidate-schedule";
import { changeVehicleActiveState } from "@/features/vehicles/application/change-vehicle-active-state";
import { vehicleActiveStateSchema } from "@/features/vehicles/schemas/vehicle-schema";
import type { VehicleQuickActionState } from "@/features/vehicles/types/vehicle";

export async function changeVehicleActiveStateAction(
  organizationSlug: string,
  vehicleId: string,
  active: boolean,
  _previousState: VehicleQuickActionState,
  _formData: FormData,
): Promise<VehicleQuickActionState> {
  void _previousState;
  void _formData;
  const validation = vehicleActiveStateSchema.safeParse({ id: vehicleId, active });
  if (!validation.success) return { status: "error", message: "Não foi possível identificar o veículo." };
  const result = await changeVehicleActiveState(organizationSlug, vehicleId, active);
  if (!result.success) return { status: "error", message: result.reason === "not_found" ? "O veículo não foi encontrado." : "Não foi possível alterar o status do veículo." };
  const listPath = `/app/${organizationSlug}/cadastros/veiculos`;
  revalidatePath(listPath);
  revalidatePath(`${listPath}/${vehicleId}`);
  revalidateSchedule(organizationSlug);
  return { status: "success", message: active ? "Veículo ativado com sucesso." : "Veículo inativado com sucesso." };
}
