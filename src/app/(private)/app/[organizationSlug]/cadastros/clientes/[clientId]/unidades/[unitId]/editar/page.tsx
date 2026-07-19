import Link from "next/link";
import { notFound } from "next/navigation";

import { ClientUnitForm } from "@/features/clients/components/client-unit-form";
import { getClientById } from "@/features/clients/queries/get-client-by-id";
import { getClientUnitById } from "@/features/clients/queries/get-client-unit-by-id";

type EditClientUnitPageProps = { params: Promise<{ organizationSlug: string; clientId: string; unitId: string }> };

export default async function EditClientUnitPage({ params }: EditClientUnitPageProps) {
  const { organizationSlug, clientId, unitId } = await params;
  const [client, unit] = await Promise.all([getClientById(organizationSlug, clientId), getClientUnitById(organizationSlug, clientId, unitId)]);
  if (!client || !unit) notFound();
  const detailPath = `/app/${organizationSlug}/cadastros/clientes/${client.id}`;

  return (
    <main className="min-h-screen bg-zinc-100 px-4 py-8 sm:px-6 lg:px-8"><div className="mx-auto max-w-4xl"><header className="mb-6"><Link href={detailPath} className="text-sm font-medium text-zinc-600 hover:text-zinc-950">← Voltar para o cliente</Link><h1 className="mt-5 text-2xl font-bold text-zinc-950">Editar unidade</h1><p className="mt-2 text-sm text-zinc-600">Atualize os dados de {unit.name}.</p></header><section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm"><ClientUnitForm organizationSlug={organizationSlug} clientId={client.id} clientName={client.legal_name} unitId={unit.id} initialValues={{ name: unit.name, taxId: unit.tax_id ?? "", addressLine: unit.address_line ?? "", addressNumber: unit.address_number ?? "", addressComplement: unit.address_complement ?? "", district: unit.district ?? "", city: unit.city, state: unit.state, postalCode: unit.postal_code ?? "", contactName: unit.contact_name ?? "", contactEmail: unit.contact_email ?? "", contactPhone: unit.contact_phone ?? "", accessInstructions: unit.access_instructions ?? "", notes: unit.notes ?? "" }} /></section></div></main>
  );
}
