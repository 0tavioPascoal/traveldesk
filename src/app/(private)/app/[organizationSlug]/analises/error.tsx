"use client";

import { PageContainer } from "@/components/page/page-container";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/error-state";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <PageContainer className="max-w-3xl">
      <ErrorState
        title="Não foi possível carregar as análises."
        description="Tente novamente para atualizar os gráficos da organização."
        action={<Button type="button" onClick={reset}>Tentar novamente</Button>}
      />
    </PageContainer>
  );
}
