"use client";

import { PageContainer } from "@/components/page/page-container";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/error-state";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <PageContainer className="max-w-3xl"><ErrorState title="Não foi possível carregar o resumo operacional." description="Tente novamente para atualizar os dados da organização." action={<Button type="button" onClick={reset}>Tentar novamente</Button>} /></PageContainer>;
}
