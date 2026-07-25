"use client";

import { PageContainer } from "@/components/page/page-container";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/error-state";

export default function TripDetailsError({ unstable_retry }: { error: Error & { digest?: string }; unstable_retry: () => void }) {
  return (
    <PageContainer>
      <ErrorState
        title="Não foi possível carregar os detalhes da viagem"
        description="Tente novamente. Se o problema persistir, volte à listagem de viagens."
        action={<Button onClick={unstable_retry}>Tentar novamente</Button>}
      />
    </PageContainer>
  );
}
