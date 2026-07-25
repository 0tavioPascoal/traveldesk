"use client";

import { PageContainer } from "@/components/page/page-container";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/error-state";

export default function NewTechnicianUnavailabilityError({ reset }: { error: Error & { digest?: string }; reset: () => void }) { return <PageContainer><ErrorState title="Não foi possível carregar os dados da indisponibilidade." action={<Button onClick={reset}>Tentar novamente</Button>} /></PageContainer>; }
