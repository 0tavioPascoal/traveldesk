"use client";

import { useEffect, useRef } from "react";

export function useFocusFirstInvalid(fieldErrors: object) {
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (Object.keys(fieldErrors).length === 0) return;
    const firstInvalid = formRef.current?.querySelector<HTMLElement>("[aria-invalid='true']");
    firstInvalid?.focus();
    firstInvalid?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [fieldErrors]);

  return formRef;
}
