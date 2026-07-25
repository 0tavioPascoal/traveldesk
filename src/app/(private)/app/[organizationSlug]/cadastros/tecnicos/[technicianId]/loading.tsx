import { PageContainer } from "@/components/page/page-container";
import { Skeleton } from "@/components/ui/skeleton";

export default function TechnicianDetailsLoading() {
  return <PageContainer><div aria-busy="true" aria-label="Carregando dados do técnico" className="space-y-6"><div className="space-y-3"><Skeleton className="h-4 w-52" /><Skeleton className="h-9 w-80 max-w-full" /><Skeleton className="h-4 w-64" /></div><Skeleton className="h-28" /><Skeleton className="h-12" /><Skeleton className="h-64" /><Skeleton className="h-56" /></div></PageContainer>;
}
