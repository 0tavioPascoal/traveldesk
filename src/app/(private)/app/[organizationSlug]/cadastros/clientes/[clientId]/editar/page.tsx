import Link from "next/link";
import { notFound } from "next/navigation";

import { ClientForm } from "@/features/clients/components/client-form";
import { getClientById } from "@/features/clients/queries/get-client-by-id";

type EditClientPageProps = { params: Promise<{ organizationSlug: string; clientId: string }> };

export default async function EditClientPage({ params }: EditClientPageProps) {
  const { organizationSlug, clientId } = await params;
  const client = await getClientById(organizationSlug, clientId);
  if (!client) notFound();
  const detailPath = `/app/${organizationSlug}/cadastros/clientes/${client.id}`;

  return (
    <main className="min-h-screen bg-zinc-100 px-4 py-8 sm:px-6 lg:px-8"><div className="mx-auto max-w-3xl"><header className="mb-6"><Link href={detailPath} className="text-sm font-medium text-zinc-600 hover:text-zinc-950">← Voltar para o cliente</Link><h1 className="mt-5 text-2xl font-bold text-zinc-950">Editar cliente</h1><p className="mt-2 text-sm text-zinc-600">Atualize os dados cadastrais. O status é alterado separadamente.</p></header><section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm"><ClientForm organizationSlug={organizationSlug} clientId={client.id} initialValues={{ legalName: client.legal_name, tradeName: client.trade_name ?? "", taxId: client.tax_id ?? "", segment: client.segment ?? "", notes: client.notes ?? "" }} /></section></div></main>
  );
}
