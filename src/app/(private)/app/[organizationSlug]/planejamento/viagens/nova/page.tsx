import Link from "next/link";

import { FormPageContainer } from "@/components/page/page-container";
import { PageHeader } from "@/components/page/page-header";
import { InlineAlert } from "@/components/ui/inline-alert";
import { requireOrganizationRole } from "@/features/organizations/application/require-organization-role";
import { TripForm } from "@/features/trips/components/trip-form";
import { listTripFormOptions } from "@/features/trips/queries/list-trip-form-options";

export default async function NewTripPage({ params }: { params: Promise<{ organizationSlug: string }> }) {
  const { organizationSlug } = await params;
  const context = await requireOrganizationRole(
    organizationSlug,
    ["admin", "coordinator"] as const,
  );
  const options = await listTripFormOptions(organizationSlug);
  const hasClientWithUnit = options.clients.some((client) =>
    client.active && options.units.some((unit) => unit.active && unit.clientId === client.id),
  );
  const basePath = `/app/${organizationSlug}/planejamento/viagens`;

  return (
    <FormPageContainer>
      <PageHeader
        title="Nova viagem"
        description="Cadastre os dados iniciais para planejar uma nova viagem técnica."
        breadcrumbs={[{ label: "Visão geral", href: `/app/${organizationSlug}/dashboard` }, { label: "Viagens", href: basePath }, { label: "Nova viagem" }]}
      />
      {!hasClientWithUnit ? (
        <InlineAlert tone="warning">
          <div><p className="font-semibold">É necessário ter um cliente ativo com ao menos uma unidade ativa.</p><Link href={`/app/${organizationSlug}/cadastros/clientes`} className="mt-2 inline-block font-semibold underline">Ir para clientes e unidades</Link></div>
        </InlineAlert>
      ) : (
        <TripForm
                mode="create"
                organizationSlug={organizationSlug}
                timezone={context.organization.timezone}
                options={options}
                initialValues={{
                  clientId: "", clientUnitId: "", serviceTypeId: "", title: "", reason: "",
                  description: "", priority: "normal", travelStartsAt: "", travelEndsAt: "",
                  serviceStartsAt: "", serviceEndsAt: "", originCity: "", originState: "",
                  destinationCity: "", destinationState: "", notes: "",
                }}
        />
      )}
    </FormPageContainer>
  );
}
