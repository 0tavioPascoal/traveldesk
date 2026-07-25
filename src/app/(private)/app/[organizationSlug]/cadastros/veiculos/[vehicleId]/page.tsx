import { PageContainer } from "@/components/page/page-container";
import { PageHeader } from "@/components/page/page-header";
import { ActiveStatusBadge } from "@/components/ui/active-status-badge";
import { InlineAlert } from "@/components/ui/inline-alert";
import { requireOrganizationRole } from "@/features/organizations/application/require-organization-role";
import { dateInTimezone, formatVehiclePlate } from "@/features/vehicles/application/vehicle-presentation";
import { VehicleOperationalBadge } from "@/features/vehicles/components/vehicle-badges";
import { VehicleDetailActions } from "@/features/vehicles/components/vehicle-detail-actions";
import { VehicleDetails } from "@/features/vehicles/components/vehicle-details";
import { getVehicleById } from "@/features/vehicles/queries/get-vehicle-by-id";
import { listVehicleOperationalPeriods } from "@/features/vehicles/queries/list-vehicle-operational-periods";

type Props = {
  params: Promise<{ organizationSlug: string; vehicleId: string }>;
  searchParams: Promise<{ feedback?: string | string[] }>;
};

export default async function VehiclePage({ params, searchParams }: Props) {
  const { organizationSlug, vehicleId } = await params;
  const context = await requireOrganizationRole(
    organizationSlug,
    ["admin", "coordinator"] as const,
  );
  const [vehicle, query, periodMap] = await Promise.all([
    getVehicleById(organizationSlug, vehicleId),
    searchParams,
    listVehicleOperationalPeriods(organizationSlug, [vehicleId]),
  ]);
  const feedback = Array.isArray(query.feedback) ? query.feedback[0] : query.feedback;
  const feedbackMessage = feedback === "created" ? "Veículo cadastrado com sucesso." : feedback === "updated" ? "Veículo atualizado com sucesso." : null;
  const now = new Date();
  const referenceDate = dateInTimezone(now, context.organization.timezone);
  const plate = formatVehiclePlate(vehicle.plate);
  const periods = periodMap.get(vehicleId) ?? { unavailabilities: [], reservations: [] };
  return <PageContainer className="max-w-7xl space-y-6"><PageHeader title={plate} eyebrow={`${vehicle.brand} ${vehicle.model}${vehicle.model_year ? ` · ${vehicle.model_year}` : ""}`} description={`${vehicle.base_city}/${vehicle.base_state}`} breadcrumbs={[{ label: "Visão geral", href: `/app/${organizationSlug}/dashboard` }, { label: "Veículos", href: `/app/${organizationSlug}/cadastros/veiculos` }, { label: plate }]} actions={<div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center"><ActiveStatusBadge active={vehicle.active} /><VehicleOperationalBadge status={vehicle.operational_status} /><VehicleDetailActions organizationSlug={organizationSlug} vehicleId={vehicleId} plate={plate} active={vehicle.active} operationalStatus={vehicle.operational_status} /></div>} />{feedbackMessage ? <InlineAlert tone="success">{feedbackMessage}</InlineAlert> : null}<VehicleDetails organizationSlug={organizationSlug} vehicle={vehicle} timezone={context.organization.timezone} referenceDate={referenceDate} referenceTime={now.toISOString()} periods={periods} /></PageContainer>;
}
