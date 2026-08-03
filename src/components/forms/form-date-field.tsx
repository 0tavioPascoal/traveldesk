"use client";

import { formErrorClassName, formHelpClassName } from "@/components/forms/form-layout";
import { DatePicker } from "@/components/ui/date-picker";

export function FormDateField({
  id,
  name,
  label,
  defaultValue,
  timezone,
  disabled,
  required,
  error,
  help,
}: {
  id: string;
  name: string;
  label: string;
  defaultValue: string;
  timezone: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  help?: string;
}) {
  const errorId = `${id}-error`;
  const helpId = `${id}-help`;
  return (
    <div className="min-w-0">
      <DatePicker
        id={id}
        name={name}
        label={label}
        defaultValue={defaultValue}
        timezone={timezone}
        disabled={disabled}
        required={required}
        ariaInvalid={Boolean(error)}
        ariaDescribedBy={error ? errorId : help ? helpId : undefined}
      />
      {help ? <p id={helpId} className={`${formHelpClassName} mt-1.5`}>{help}</p> : null}
      {error ? <p id={errorId} role="alert" className={`${formErrorClassName} mt-1.5`}>{error}</p> : null}
    </div>
  );
}
