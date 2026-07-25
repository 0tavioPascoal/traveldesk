"use client";

import { PageContainer } from "@/components/page/page-container";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/error-state";

export default function UnavailabilitiesError({ reset }: { error: Error & { digest?: string }; reset: () => void }) { return <PageContainer><ErrorState title="Não foi possível carregar as indisponibilidades." description="Tente novamente. Se o problema persistir, volte mais tarde." action={<Button onClick={reset}>Tentar novamente</Button>} /></PageContainer>; }
