"use client";

import Link from "next/link";
import { useActionState } from "react";

import { CatalogFormFields } from "@/components/catalog/catalog-form-fields";
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
  const listPath = `/app/${organizationSlug}/cadastros/especialidades`;

  return (
    <form action={formAction} noValidate className="space-y-6">
      <CatalogFormFields idPrefix="skill" values={state.values} errors={state.fieldErrors} pending={pending} namePlaceholder="Ex.: Integração de sistemas" descriptionHelp="Descreva de forma breve o conhecimento ou competência representada. Máximo de 1.000 caracteres." activeHelp="Especialidades ativas ficam disponíveis para novos vínculos e planejamentos." />

      {state.message ? <InlineAlert tone="error">{state.message}</InlineAlert> : null}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link
          href={listPath}
          className={buttonStyles({ variant: "secondary" })}
        >
          Cancelar
        </Link>
        <button
          type="submit"
          disabled={pending}
          className={buttonStyles()}
        >
          {pending ? "Salvando..." : skillId ? "Salvar alterações" : "Criar especialidade"}
        </button>
      </div>
    </form>
  );
}
