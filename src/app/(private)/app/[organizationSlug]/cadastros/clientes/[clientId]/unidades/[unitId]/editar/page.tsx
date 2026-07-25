import { notFound } from "next/navigation";

import { PageContainer } from "@/components/page/page-container";
import { PageHeader } from "@/components/page/page-header";
import { ActiveStatusBadge } from "@/components/ui/active-status-badge";
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
    <PageContainer className="max-w-5xl space-y-6">
      <PageHeader title="Editar unidade" description="Atualize identificação, endereço e contato sem alterar o vínculo com o cliente." eyebrow={`${client.legal_name} • ${unit.name}`} breadcrumbs={[{ label: "Visão geral", href: `/app/${organizationSlug}/dashboard` }, { label: "Clientes", href: `/app/${organizationSlug}/cadastros/clientes` }, { label: client.legal_name, href: `${detailPath}#unidades` }, { label: unit.name }, { label: "Editar" }]} actions={<ActiveStatusBadge active={unit.active} feminine />} />
      <ClientUnitForm organizationSlug={organizationSlug} clientId={client.id} clientName={client.legal_name} unitId={unit.id} initialValues={{ name: unit.name, taxId: unit.tax_id ?? "", addressLine: unit.address_line ?? "", addressNumber: unit.address_number ?? "", addressComplement: unit.address_complement ?? "", district: unit.district ?? "", city: unit.city, state: unit.state, postalCode: unit.postal_code ?? "", contactName: unit.contact_name ?? "", contactEmail: unit.contact_email ?? "", contactPhone: unit.contact_phone ?? "", accessInstructions: unit.access_instructions ?? "", notes: unit.notes ?? "" }} />
    </PageContainer>
  );
}
