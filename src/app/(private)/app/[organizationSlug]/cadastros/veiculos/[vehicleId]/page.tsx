import Link from "next/link";

import { requireOrganizationRole } from "@/features/organizations/application/require-organization-role";
import { VehicleDetails } from "@/features/vehicles/components/vehicle-details";
import { getVehicleById } from "@/features/vehicles/queries/get-vehicle-by-id";

type Props = {
  params: Promise<{ organizationSlug: string; vehicleId: string }>;
  searchParams: Promise<{ feedback?: string | string[] }>;
};

export default async function VehiclePage({ params, searchParams }: Props) {
  const { organizationSlug, vehicleId } = await params;
  const context = await requireOrganizationRole(
    organizationSlug,
    ["admin", "coordinator"] as const,
  );
  const [vehicle, query] = await Promise.all([
    getVehicleById(organizationSlug, vehicleId),
    searchParams,
  ]);
  const feedback = Array.isArray(query.feedback) ? query.feedback[0] : query.feedback;
  return <main className="min-h-screen bg-zinc-100 px-4 py-8 sm:px-6"><div className="mx-auto max-w-5xl space-y-6"><header><Link href={`/app/${organizationSlug}/cadastros/veiculos`} className="text-sm font-medium text-zinc-600">← Voltar aos veículos</Link><h1 className="mt-2 text-2xl font-bold">Detalhes do veículo</h1></header>{feedback ? <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{feedback === "created" ? "Veículo cadastrado com sucesso." : "Veículo atualizado com sucesso."}</p> : null}<VehicleDetails organizationSlug={organizationSlug} vehicle={vehicle} timezone={context.organization.timezone} /></div></main>;
}
