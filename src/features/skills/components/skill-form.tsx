"use client";

import { useActionState, useState } from "react";

import { CatalogFormFields } from "@/components/catalog/catalog-form-fields";
import { FormCancelLink } from "@/components/forms/form-cancel-link";
import { FormActions, FormSurface } from "@/components/forms/form-layout";
import { useFocusFirstInvalid } from "@/components/forms/use-focus-first-invalid";
import { buttonStyles } from "@/components/ui/button";
import { InlineAlert } from "@/components/ui/inline-alert";
import { createSkillAction } from "@/features/skills/actions/create-skill-action";
import { updateSkillAction } from "@/features/skills/actions/update-skill-action";
import type {
  SkillActionState,
  SkillFormValues,
} from "@/features/skills/types/skill";

type SkillFormProps = {
  organizationSlug: string;
  initialValues: SkillFormValues;
  skillId?: string;
};

export function SkillForm({
  organizationSlug,
  initialValues,
  skillId,
}: SkillFormProps) {
  const action = skillId
    ? updateSkillAction.bind(null, organizationSlug, skillId)
    : createSkillAction.bind(null, organizationSlug);
  const initialState: SkillActionState = {
    status: "idle",
    fieldErrors: {},
    message: null,
    values: initialValues,
  };
  const [state, formAction, pending] = useActionState(action, initialState);
  const formRef = useFocusFirstInvalid(state.fieldErrors);
  const [dirty, setDirty] = useState(false);
  const listPath = `/app/${organizationSlug}/cadastros/especialidades`;

  return (
    <form ref={formRef} action={formAction} noValidate onChange={() => setDirty(true)} className="space-y-6">
      <FormSurface><div className="space-y-5"><CatalogFormFields idPrefix="skill" values={state.values} errors={state.fieldErrors} pending={pending} namePlaceholder="Ex.: Integração de sistemas" descriptionHelp="Descreva de forma breve o conhecimento ou competência representada. Máximo de 1.000 caracteres." activeHelp="Especialidades ativas ficam disponíveis para novos vínculos e planejamentos." /></div></FormSurface>

      {state.message ? <InlineAlert tone="error">{state.message}</InlineAlert> : null}

      <FormActions>
        <FormCancelLink href={listPath} dirty={dirty} />
        <button
          type="submit"
          disabled={pending}
          className={buttonStyles()}
        >
          {pending ? "Salvando..." : skillId ? "Salvar alterações" : "Criar especialidade"}
        </button>
      </FormActions>
    </form>
  );
}
