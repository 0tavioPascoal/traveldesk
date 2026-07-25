"use client";

import { PageContainer } from "@/components/page/page-container";
import { buttonStyles } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/error-state";

export default function TechnicianDetailsError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <PageContainer><ErrorState title="Não foi possível carregar os dados do técnico" description="Tente carregar os dados novamente." action={<button type="button" onClick={reset} className={buttonStyles()}>Tentar novamente</button>} /></PageContainer>;
}
