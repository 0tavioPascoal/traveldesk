import { notFound } from "next/navigation";

import { FormPageContainer } from "@/components/page/page-container";
import { PageHeader } from "@/components/page/page-header";
import { ServiceTypeForm } from "@/features/service-types/components/service-type-form";
import { getServiceTypeById } from "@/features/service-types/queries/get-service-type-by-id";

type EditServiceTypePageProps = {
  params: Promise<{ organizationSlug: string; serviceTypeId: string }>;
};

export default async function EditServiceTypePage({
  params,
}: EditServiceTypePageProps) {
  const { organizationSlug, serviceTypeId } = await params;
  const serviceType = await getServiceTypeById(
    organizationSlug,
    serviceTypeId,
  );

  if (!serviceType) {
    notFound();
  }

  const listPath = `/app/${organizationSlug}/cadastros/tipos-atendimento`;

  return (
    <FormPageContainer>
        <PageHeader title="Editar tipo de atendimento" description="Atualize a categoria e sua disponibilidade para novos atendimentos." breadcrumbs={[{ label: "Visão geral", href: `/app/${organizationSlug}/dashboard` }, { label: "Tipos de atendimento", href: listPath }, { label: "Editar" }]} />
          <ServiceTypeForm
            organizationSlug={organizationSlug}
            serviceTypeId={serviceType.id}
            initialValues={{
              name: serviceType.name,
              description: serviceType.description ?? "",
              active: serviceType.active,
            }}
          />
    </FormPageContainer>
  );
}
