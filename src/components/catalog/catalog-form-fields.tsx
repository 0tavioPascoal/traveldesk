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

const fieldStyles =
  "w-full rounded-lg border border-input bg-background text-foreground outline-none transition placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-70 aria-[invalid=true]:border-destructive";

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
    <>
      <div className="space-y-2">
        <label htmlFor={`${idPrefix}-name`} className="block text-sm font-medium text-foreground">
          Nome
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
          className={`${fieldStyles} h-11 px-3 text-base sm:text-sm`}
        />
        <p id={nameHelpId} className="text-xs text-muted-foreground">
          Entre 2 e 120 caracteres. O nome deve ser único na organização.
        </p>
        {nameError ? <p id={nameErrorId} role="alert" className="text-sm text-destructive">{nameError}</p> : null}
      </div>

      <div className="space-y-2">
        <label htmlFor={`${idPrefix}-description`} className="block text-sm font-medium text-foreground">
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
          className={`${fieldStyles} min-h-32 resize-y px-3 py-2 text-base sm:text-sm`}
        />
        <p id={descriptionHelpId} className="text-xs text-muted-foreground">{descriptionHelp}</p>
        {descriptionError ? <p id={descriptionErrorId} role="alert" className="text-sm text-destructive">{descriptionError}</p> : null}
      </div>

      <div>
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
        {activeError ? <p id={activeErrorId} role="alert" className="mt-2 text-sm text-destructive">{activeError}</p> : null}
      </div>
    </>
  );
}
