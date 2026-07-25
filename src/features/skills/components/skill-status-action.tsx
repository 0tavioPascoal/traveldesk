import { CatalogStatusDialog } from "@/components/catalog/catalog-status-dialog";
import { changeSkillStatusAction } from "@/features/skills/actions/change-skill-status-action";

type SkillStatusActionProps = {
  organizationSlug: string;
  skillId: string;
  active: boolean;
};

export function SkillStatusAction({
  organizationSlug,
  skillId,
  active,
}: SkillStatusActionProps) {
  const action = changeSkillStatusAction.bind(
    null,
    organizationSlug,
    skillId,
    !active,
  );
  return <CatalogStatusDialog action={action} active={active} entityName="especialidade" deactivateDescription="A especialidade deixará de estar disponível para novos vínculos e planejamentos. Os vínculos e dados históricos serão preservados." reactivateDescription="A especialidade voltará a ficar disponível para novos vínculos e planejamentos." />;
}
