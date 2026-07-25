import { notFound } from "next/navigation";

import { PageContainer } from "@/components/page/page-container";
import { PageHeader } from "@/components/page/page-header";
import { ActiveStatusBadge } from "@/components/ui/active-status-badge";
import { ClientForm } from "@/features/clients/components/client-form";
import { getClientById } from "@/features/clients/queries/get-client-by-id";

type EditClientPageProps = { params: Promise<{ organizationSlug: string; clientId: string }> };

export default async function EditClientPage({ params }: EditClientPageProps) {
  const { organizationSlug, clientId } = await params;
  const client = await getClientById(organizationSlug, clientId);
  if (!client) notFound();
  const detailPath = `/app/${organizationSlug}/cadastros/clientes/${client.id}`;

  return (
    <PageContainer className="max-w-5xl space-y-6">
      <PageHeader title="Editar cliente" description="Atualize os dados cadastrais. A situação é gerenciada separadamente no detalhe do cliente." eyebrow={client.legal_name} breadcrumbs={[{ label: "Visão geral", href: `/app/${organizationSlug}/dashboard` }, { label: "Clientes", href: `/app/${organizationSlug}/cadastros/clientes` }, { label: client.legal_name, href: detailPath }, { label: "Editar" }]} actions={<ActiveStatusBadge active={client.active} />} />
      <ClientForm organizationSlug={organizationSlug} clientId={client.id} initialValues={{ legalName: client.legal_name, tradeName: client.trade_name ?? "", taxId: client.tax_id ?? "", segment: client.segment ?? "", notes: client.notes ?? "" }} />
    </PageContainer>
  );
}
