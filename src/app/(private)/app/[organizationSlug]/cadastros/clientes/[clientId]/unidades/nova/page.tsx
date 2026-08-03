import { notFound } from "next/navigation";

import { FormPageContainer } from "@/components/page/page-container";
import { PageHeader } from "@/components/page/page-header";
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
    <FormPageContainer>
      <PageHeader title="Nova unidade" description="Cadastre o local de atendimento, endereço e contato principal da unidade." eyebrow={client.legal_name} breadcrumbs={[{ label: "Visão geral", href: `/app/${organizationSlug}/dashboard` }, { label: "Clientes", href: `/app/${organizationSlug}/cadastros/clientes` }, { label: client.legal_name, href: `${detailPath}#unidades` }, { label: "Nova unidade" }]} />
      <ClientUnitForm organizationSlug={organizationSlug} clientId={client.id} clientName={client.legal_name} initialValues={emptyValues} />
    </FormPageContainer>
  );
}
