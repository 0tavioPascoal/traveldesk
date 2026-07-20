"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { readVehicleFormValues } from "@/features/vehicles/actions/read-vehicle-form-values";
import { createVehicle } from "@/features/vehicles/application/create-vehicle";
import { vehicleFormSchema } from "@/features/vehicles/schemas/vehicle-schema";
import type { VehicleActionState } from "@/features/vehicles/types/vehicle";

export async function createVehicleAction(
  organizationSlug: string,
  _previousState: VehicleActionState,
  formData: FormData,
): Promise<VehicleActionState> {
  const values = readVehicleFormValues(formData);
  const validation = vehicleFormSchema.safeParse(values);
  if (!validation.success) {
    return {
      status: "error",
      fieldErrors: z.flattenError(validation.error).fieldErrors,
      message: "Revise os campos destacados.",
      values,
    };
  }
  const result = await createVehicle(organizationSlug, validation.data);
  if (!result.success) {
    return {
      status: "error",
      fieldErrors: {},
      message: result.reason === "duplicate_plate"
        ? "Já existe um veículo com esta placa na organização."
        : "Não foi possível cadastrar o veículo. Tente novamente.",
      values,
    };
  }
  const listPath = `/app/${organizationSlug}/cadastros/veiculos`;
  revalidatePath(listPath);
  redirect(`${listPath}/${result.vehicleId}?feedback=created`);
}
