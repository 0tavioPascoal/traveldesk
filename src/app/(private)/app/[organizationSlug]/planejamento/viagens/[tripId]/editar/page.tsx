import { notFound } from "next/navigation";

import { FormPageContainer } from "@/components/page/page-container";
import { PageHeader } from "@/components/page/page-header";
import { requireOrganizationRole } from "@/features/organizations/application/require-organization-role";
import { formatTripDateTimeForForm } from "@/features/trips/application/normalize-trip-periods";
import { TripForm } from "@/features/trips/components/trip-form";
import { TripPriorityBadge, TripStatusBadge } from "@/features/trips/components/trip-badges";
import { getTripById } from "@/features/trips/queries/get-trip-by-id";
import { listTripFormOptions } from "@/features/trips/queries/list-trip-form-options";
import { tripIdSchema } from "@/features/trips/schemas/trip-schema";

export default async function EditTripPage({ params }: { params: Promise<{ organizationSlug: string; tripId: string }> }) {
  const { organizationSlug, tripId } = await params;
  const parsedId = tripIdSchema.safeParse(tripId);
  if (!parsedId.success) notFound();
  const context = await requireOrganizationRole(
    organizationSlug,
    ["admin", "coordinator"] as const,
  );
  const trip = await getTripById(organizationSlug, parsedId.data);
  if (!trip || (trip.status !== "draft" && trip.status !== "planned")) notFound();
  const options = await listTripFormOptions(organizationSlug, {
    clientId: trip.client_id,
    clientUnitId: trip.client_unit_id,
    serviceTypeId: trip.service_type_id,
  });
  const timezone = context.organization.timezone;

  return (
    <FormPageContainer>
      <PageHeader
        title="Editar viagem"
        eyebrow={trip.code}
        description={`Atualize os dados de planejamento permitidos para “${trip.title}”.`}
        breadcrumbs={[{ label: "Visão geral", href: `/app/${organizationSlug}/dashboard` }, { label: "Viagens", href: `/app/${organizationSlug}/planejamento/viagens` }, { label: trip.code, href: `/app/${organizationSlug}/planejamento/viagens/${trip.id}` }, { label: "Editar" }]}
        actions={<div className="flex flex-wrap gap-2"><TripStatusBadge status={trip.status} /><TripPriorityBadge priority={trip.priority} /></div>}
      />
      <TripForm
              mode="edit"
              organizationSlug={organizationSlug}
              timezone={timezone}
              options={options}
              tripId={trip.id}
              currentStatus={trip.status}
              initialValues={{
                clientId: trip.client_id,
                clientUnitId: trip.client_unit_id,
                serviceTypeId: trip.service_type_id ?? "",
                title: trip.title,
                reason: trip.reason ?? "",
                description: trip.description ?? "",
                priority: trip.priority,
                travelStartsAt: formatTripDateTimeForForm(trip.travel_starts_at, timezone),
                travelEndsAt: formatTripDateTimeForForm(trip.travel_ends_at, timezone),
                serviceStartsAt: formatTripDateTimeForForm(trip.service_starts_at, timezone),
                serviceEndsAt: formatTripDateTimeForForm(trip.service_ends_at, timezone),
                originCity: trip.origin_city ?? "",
                originState: trip.origin_state ?? "",
                destinationCity: trip.destination_city ?? "",
                destinationState: trip.destination_state ?? "",
                notes: trip.notes ?? "",
              }}
      />
    </FormPageContainer>
  );
}
