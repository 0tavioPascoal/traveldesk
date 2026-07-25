import { CatalogStatusDialog } from "@/components/catalog/catalog-status-dialog";
import { changeServiceTypeStatusAction } from "@/features/service-types/actions/change-service-type-status-action";

type ServiceTypeStatusActionProps = {
  organizationSlug: string;
  serviceTypeId: string;
  active: boolean;
};

export function ServiceTypeStatusAction({
  organizationSlug,
  serviceTypeId,
  active,
}: ServiceTypeStatusActionProps) {
  const action = changeServiceTypeStatusAction.bind(
    null,
    organizationSlug,
    serviceTypeId,
    !active,
  );
  return <CatalogStatusDialog action={action} active={active} entityName="tipo de atendimento" deactivateDescription="O tipo deixará de estar disponível para novos atendimentos. As viagens e os dados históricos serão preservados." reactivateDescription="O tipo voltará a ficar disponível para classificar novos atendimentos." />;
}
