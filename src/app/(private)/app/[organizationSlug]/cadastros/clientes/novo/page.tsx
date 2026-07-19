import Link from "next/link";

import { ClientForm } from "@/features/clients/components/client-form";
import { requireOrganizationRole } from "@/features/organizations/application/require-organization-role";

type NewClientPageProps = { params: Promise<{ organizationSlug: string }> };
const administrativeRoles = ["admin", "coordinator"] as const;

export default async function NewClientPage({ params }: NewClientPageProps) {
  const { organizationSlug } = await params;
  const context = await requireOrganizationRole(organizationSlug, administrativeRoles);
  const listPath = `/app/${organizationSlug}/cadastros/clientes`;

  return (
    <main className="min-h-screen bg-zinc-100 px-4 py-8 sm:px-6 lg:px-8"><div className="mx-auto max-w-3xl"><header className="mb-6"><Link href={listPath} className="text-sm font-medium text-zinc-600 hover:text-zinc-950">← Voltar para clientes</Link><p className="mt-5 text-sm font-medium text-zinc-500">{context.organization.name}</p><h1 className="mt-1 text-2xl font-bold text-zinc-950">Novo cliente</h1><p className="mt-2 text-sm text-zinc-600">Cadastre os dados principais do cliente.</p></header><section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm"><ClientForm organizationSlug={organizationSlug} initialValues={{ legalName: "", tradeName: "", taxId: "", segment: "", notes: "" }} /></section></div></main>
  );
}
