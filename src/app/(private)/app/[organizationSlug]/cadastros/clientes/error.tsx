"use client";

import { PageContainer } from "@/components/page/page-container";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/error-state";

export default function ClientsError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <PageContainer>
      <ErrorState title="Não foi possível carregar os clientes" description="Tente carregar esta área novamente. Nenhuma alteração foi realizada." action={<Button type="button" onClick={reset}>Tentar novamente</Button>} />
    </PageContainer>
  );
}
