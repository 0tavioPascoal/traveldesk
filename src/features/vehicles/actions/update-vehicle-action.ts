"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { readVehicleFormValues } from "@/features/vehicles/actions/read-vehicle-form-values";
import { updateVehicle } from "@/features/vehicles/application/update-vehicle";
import { vehicleFormSchema, vehicleIdSchema } from "@/features/vehicles/schemas/vehicle-schema";
import type { VehicleActionState } from "@/features/vehicles/types/vehicle";

export async function updateVehicleAction(
  organizationSlug: string,
  vehicleId: string,
  _previousState: VehicleActionState,
  formData: FormData,
): Promise<VehicleActionState> {
  const values = readVehicleFormValues(formData);
  const [idResult, formResult] = await Promise.all([
    vehicleIdSchema.safeParseAsync(vehicleId),
    vehicleFormSchema.safeParseAsync(values),
  ]);
  if (!idResult.success) return { status: "error", fieldErrors: {}, message: "Veículo inválido.", values };
  if (!formResult.success) return { status: "error", fieldErrors: z.flattenError(formResult.error).fieldErrors, message: "Revise os campos destacados.", values };

  const result = await updateVehicle(organizationSlug, idResult.data, formResult.data);
  if (!result.success) {
    const messages = {
      duplicate_plate: "Já existe um veículo com esta placa na organização.",
      mileage_reduction_forbidden: "Somente administradores podem reduzir ou remover uma quilometragem já registrada.",
      not_found: "O veículo não foi encontrado.",
      unexpected: "Não foi possível atualizar o veículo. Tente novamente.",
    } as const;
    return { status: "error", fieldErrors: {}, message: messages[result.reason], values };
  }
  const detailPath = `/app/${organizationSlug}/cadastros/veiculos/${vehicleId}`;
  revalidatePath(`/app/${organizationSlug}/cadastros/veiculos`);
  revalidatePath(detailPath);
  redirect(`${detailPath}?feedback=updated`);
}
