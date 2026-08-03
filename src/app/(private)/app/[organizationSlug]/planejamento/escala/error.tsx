"use client";

import { PageContainer } from "@/components/page/page-container";
import { buttonStyles } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/error-state";

export default function ScheduleError({
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <PageContainer>
      <ErrorState
        title="Não foi possível carregar a escala."
        description="Tente novamente. Nenhum detalhe interno foi exposto."
        action={<button type="button" onClick={unstable_retry} className={buttonStyles()}>Tentar novamente</button>}
      />
    </PageContainer>
  );
}
