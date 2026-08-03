"use client";

import { ListErrorState } from "@/components/list-page/list-error-state";

export default function UnavailabilitiesError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ListErrorState
      title="Não foi possível carregar as indisponibilidades"
      retry={reset}
    />
  );
}
