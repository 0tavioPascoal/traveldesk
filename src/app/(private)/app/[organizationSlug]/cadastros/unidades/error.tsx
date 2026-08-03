"use client";

import { ListErrorState } from "@/components/list-page/list-error-state";

export default function ClientUnitsError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ListErrorState
      title="Não foi possível carregar as unidades"
      retry={reset}
    />
  );
}
