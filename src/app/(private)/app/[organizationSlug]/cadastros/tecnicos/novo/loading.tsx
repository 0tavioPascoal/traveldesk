import { PageContainer } from "@/components/page/page-container";
import { Skeleton } from "@/components/ui/skeleton";

export default function NewTechnicianLoading() {
  return <PageContainer className="max-w-5xl"><div aria-busy="true" aria-label="Carregando formulário do técnico" className="space-y-6"><Skeleton className="h-24" />{Array.from({ length: 4 }, (_, index) => <Skeleton key={index} className="h-52" />)}</div></PageContainer>;
}
