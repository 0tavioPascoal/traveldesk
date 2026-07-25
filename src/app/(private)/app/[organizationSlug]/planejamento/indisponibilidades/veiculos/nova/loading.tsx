import { PageContainer } from "@/components/page/page-container";
import { Skeleton } from "@/components/ui/skeleton";

export default function NewVehicleUnavailabilityLoading() { return <PageContainer className="max-w-5xl"><div aria-busy="true" aria-label="Carregando formulário de indisponibilidade" className="space-y-6"><Skeleton className="h-24" /><Skeleton className="h-72" /><Skeleton className="h-52" /></div></PageContainer>; }
