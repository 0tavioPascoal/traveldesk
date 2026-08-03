"use client";

import { ListErrorState } from "@/components/list-page/list-error-state";

export default function TripsError({
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <ListErrorState
      title="Não foi possível carregar as viagens"
      retry={unstable_retry}
    />
  );
}
