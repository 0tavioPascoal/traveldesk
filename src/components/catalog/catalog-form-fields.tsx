type CatalogFormFieldsProps = {
  idPrefix: string;
  values: {
    name: string;
    description: string;
    active: boolean;
  };
  errors: {
    name?: string[];
    description?: string[];
    active?: string[];
  };
  pending: boolean;
  namePlaceholder: string;
  descriptionHelp: string;
  activeHelp: string;
};

export function CatalogFormFields({
  idPrefix,
  values,
  errors,
  pending,
  namePlaceholder,
  descriptionHelp,
  activeHelp,
}: CatalogFormFieldsProps) {
  const nameError = errors.name?.[0];
  const descriptionError = errors.description?.[0];
  const activeError = errors.active?.[0];
  const nameHelpId = `${idPrefix}-name-help`;
  const nameErrorId = `${idPrefix}-name-error`;
  const descriptionHelpId = `${idPrefix}-description-help`;
  const descriptionErrorId = `${idPrefix}-description-error`;
  const activeHelpId = `${idPrefix}-active-help`;
  const activeErrorId = `${idPrefix}-active-error`;

  return (
    <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(18rem,1fr)]">
      <div className={formFieldClassName}>
        <label htmlFor={`${idPrefix}-name`} className={formLabelClassName}>
          Nome <RequiredIndicator />
        </label>
        <input
          id={`${idPrefix}-name`}
          name="name"
          type="text"
          required
          minLength={2}
          maxLength={120}
          autoFocus
          disabled={pending}
          defaultValue={values.name}
          placeholder={namePlaceholder}
          aria-invalid={nameError ? true : undefined}
          aria-describedby={nameError ? nameErrorId : nameHelpId}
          className={formControlClassName}
        />
        <p id={nameHelpId} className={formHelpClassName}>
          Entre 2 e 120 caracteres. O nome deve ser único na organização.
        </p>
        {nameError ? <p id={nameErrorId} role="alert" className={formErrorClassName}>{nameError}</p> : null}
      </div>

      <div className={`${formFieldClassName} lg:col-span-2`}>
        <label htmlFor={`${idPrefix}-description`} className={formLabelClassName}>
          Descrição
        </label>
        <textarea
          id={`${idPrefix}-description`}
          name="description"
          rows={5}
          maxLength={1000}
          disabled={pending}
          defaultValue={values.description}
          aria-invalid={descriptionError ? true : undefined}
          aria-describedby={descriptionError ? descriptionErrorId : descriptionHelpId}
          className={formTextareaClassName}
        />
        <p id={descriptionHelpId} className={formHelpClassName}>{descriptionHelp}</p>
        {descriptionError ? <p id={descriptionErrorId} role="alert" className={formErrorClassName}>{descriptionError}</p> : null}
      </div>

      <div className="lg:col-start-2 lg:row-start-1">
        <label className="flex items-start gap-3 rounded-xl border border-border bg-muted/40 p-4">
          <input
            name="active"
            type="checkbox"
            defaultChecked={values.active}
            disabled={pending}
            aria-invalid={activeError ? true : undefined}
            aria-describedby={activeError ? activeErrorId : activeHelpId}
            className="mt-0.5 size-4 rounded border-input accent-primary"
          />
          <span>
            <span className="block text-sm font-medium text-foreground">Ativo</span>
            <span id={activeHelpId} className="mt-1 block text-xs leading-5 text-muted-foreground">{activeHelp}</span>
          </span>
        </label>
        {activeError ? <p id={activeErrorId} role="alert" className={`${formErrorClassName} mt-2`}>{activeError}</p> : null}
      </div>
    </div>
  );
}
import {
  formControlClassName,
  formErrorClassName,
  formFieldClassName,
  formHelpClassName,
  formLabelClassName,
  formTextareaClassName,
  RequiredIndicator,
} from "@/components/forms/form-layout";
