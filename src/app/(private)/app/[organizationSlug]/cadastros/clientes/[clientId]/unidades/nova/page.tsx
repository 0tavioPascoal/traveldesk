import Link from "next/link";
import { notFound } from "next/navigation";

import { ClientUnitForm } from "@/features/clients/components/client-unit-form";
import { getClientById } from "@/features/clients/queries/get-client-by-id";

type NewClientUnitPageProps = { params: Promise<{ organizationSlug: string; clientId: string }> };

export default async function NewClientUnitPage({ params }: NewClientUnitPageProps) {
  const { organizationSlug, clientId } = await params;
  const client = await getClientById(organizationSlug, clientId);
  if (!client || !client.active) notFound();
  const detailPath = `/app/${organizationSlug}/cadastros/clientes/${client.id}`;
  const emptyValues = { name: "", taxId: "", addressLine: "", addressNumber: "", addressComplement: "", district: "", city: "", state: "", postalCode: "", contactName: "", contactEmail: "", contactPhone: "", accessInstructions: "", notes: "" };

  return (
    <main className="min-h-screen bg-zinc-100 px-4 py-8 sm:px-6 lg:px-8"><div className="mx-auto max-w-4xl"><header className="mb-6"><Link href={detailPath} className="text-sm font-medium text-zinc-600 hover:text-zinc-950">← Voltar para o cliente</Link><h1 className="mt-5 text-2xl font-bold text-zinc-950">Nova unidade</h1><p className="mt-2 text-sm text-zinc-600">Cadastre uma unidade de {client.legal_name}.</p></header><section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm"><ClientUnitForm organizationSlug={organizationSlug} clientId={client.id} clientName={client.legal_name} initialValues={emptyValues} /></section></div></main>
  );
}
