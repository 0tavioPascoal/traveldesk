import Link from "next/link";

import { requireOrganizationRole } from "@/features/organizations/application/require-organization-role";
import { VehicleForm } from "@/features/vehicles/components/vehicle-form";

export default async function NewVehiclePage({ params }: { params: Promise<{ organizationSlug: string }> }) {
  const { organizationSlug } = await params;
  const context = await requireOrganizationRole(
    organizationSlug,
    ["admin", "coordinator"] as const,
  );
  return <main className="min-h-screen bg-zinc-100 px-4 py-8 sm:px-6"><div className="mx-auto max-w-5xl"><Link href={`/app/${organizationSlug}/cadastros/veiculos`} className="text-sm font-medium text-zinc-600">← Voltar aos veículos</Link><div className="mt-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm"><h1 className="text-2xl font-bold">Novo veículo</h1><p className="mt-1 text-sm text-zinc-600">Cadastre os dados operacionais do veículo.</p><div className="mt-6"><VehicleForm organizationSlug={organizationSlug} role={context.membership.role as "admin" | "coordinator"} currentMileage={null} initialValues={{ plate: "", brand: "", model: "", manufactureYear: "", modelYear: "", passengerCapacity: "", baseCity: "", baseState: "", currentMileage: "", operationalStatus: "available", licensingExpiresAt: "", maintenanceDueAt: "", notes: "" }} /></div></div></div></main>;
}
