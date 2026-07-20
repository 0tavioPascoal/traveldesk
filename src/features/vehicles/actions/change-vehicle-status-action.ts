"use server";

import { revalidatePath } from "next/cache";

import { changeVehicleStatus } from "@/features/vehicles/application/change-vehicle-status";
import { vehicleOperationalStatusSchema } from "@/features/vehicles/schemas/vehicle-schema";
import type { VehicleOperationalStatus, VehicleQuickActionState } from "@/features/vehicles/types/vehicle";

export async function changeVehicleStatusAction(
  organizationSlug: string,
  vehicleId: string,
  operationalStatus: VehicleOperationalStatus,
  _previousState: VehicleQuickActionState,
  _formData: FormData,
): Promise<VehicleQuickActionState> {
  void _previousState;
  void _formData;
  const validation = vehicleOperationalStatusSchema.safeParse({ id: vehicleId, operationalStatus });
  if (!validation.success) return { status: "error", message: "Selecione uma condição operacional válida." };
  const result = await changeVehicleStatus(organizationSlug, vehicleId, operationalStatus);
  if (!result.success) return { status: "error", message: result.reason === "not_found" ? "O veículo não foi encontrado." : "Não foi possível alterar a condição operacional." };
  const listPath = `/app/${organizationSlug}/cadastros/veiculos`;
  revalidatePath(listPath);
  revalidatePath(`${listPath}/${vehicleId}`);
  const labels = { available: "disponível", maintenance: "em manutenção", blocked: "bloqueado" } as const;
  return { status: "success", message: `Veículo marcado como ${labels[operationalStatus]}.` };
}
