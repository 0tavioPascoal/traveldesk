import Link from "next/link";

import { requireOrganizationRole } from "@/features/organizations/application/require-organization-role";
import { UnavailabilityTypeForm } from "@/features/unavailabilities/components/unavailability-type-form";

export default async function NewVehicleUnavailabilityTypePage({ params }: { params: Promise<{ organizationSlug: string }> }) {
  const { organizationSlug } = await params;
  await requireOrganizationRole(organizationSlug, ["admin", "coordinator"] as const);
  const path = `/app/${organizationSlug}/cadastros/tipos-indisponibilidade/veiculos`;
  return <main className="min-h-screen bg-zinc-100 px-4 py-8 sm:px-6"><div className="mx-auto max-w-3xl"><Link href={path} className="text-sm font-medium text-zinc-600">← Voltar aos tipos</Link><div className="mt-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm"><h1 className="text-2xl font-bold">Novo tipo para veículo</h1><p className="mt-1 text-sm text-zinc-600">Cadastre um motivo configurável da organização.</p><div className="mt-6"><UnavailabilityTypeForm organizationSlug={organizationSlug} resource="vehicles" initialValues={{ name: "", description: "", active: true }} /></div></div></div></main>;
}
