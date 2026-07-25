import { CatalogStatusDialog } from "@/components/catalog/catalog-status-dialog";
import { changeTechnicianUnavailabilityTypeStatusAction } from "@/features/unavailabilities/actions/change-technician-unavailability-type-status-action";
import { changeVehicleUnavailabilityTypeStatusAction } from "@/features/unavailabilities/actions/change-vehicle-unavailability-type-status-action";
import type { UnavailabilityResourceKind } from "@/features/unavailabilities/types/unavailability";

export function UnavailabilityTypeStatusAction({
  organizationSlug,
  resource,
  typeId,
  active,
}: {
  organizationSlug: string;
  resource: UnavailabilityResourceKind;
  typeId: string;
  active: boolean;
}) {
  const action = resource === "technicians"
    ? changeTechnicianUnavailabilityTypeStatusAction.bind(null, organizationSlug, typeId, !active)
    : changeVehicleUnavailabilityTypeStatusAction.bind(null, organizationSlug, typeId, !active);
  const entityName = resource === "technicians" ? "tipo para técnico" : "tipo para veículo";
  return <CatalogStatusDialog action={action} active={active} entityName={entityName} deactivateDescription="O tipo deixará de estar disponível para novas indisponibilidades. Os períodos e dados históricos serão preservados." reactivateDescription="O tipo voltará a ficar disponível para novas indisponibilidades deste recurso." />;
}
