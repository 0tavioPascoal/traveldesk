import { PageContainer } from "@/components/page/page-container";
import { Skeleton } from "@/components/ui/skeleton";

export default function ScheduleLoading() {
  return (
    <PageContainer>
      <div aria-busy="true" aria-label="Carregando escala" className="space-y-4">
        <div className="space-y-3"><Skeleton className="h-4 w-40" /><Skeleton className="h-8 w-48" /><Skeleton className="h-4 w-full max-w-xl" /></div>
        <div className="grid grid-cols-2 gap-2 xl:grid-cols-4">{Array.from({ length: 4 }, (_, index) => <Skeleton key={index} className="h-20 rounded-xl" />)}</div>
        <Skeleton className="h-24 rounded-xl lg:h-14" />
        <Skeleton className="h-10 w-full rounded-xl" />
        <div className="overflow-hidden rounded-xl border border-border"><Skeleton className="h-16 rounded-none" /><Skeleton className="h-[42rem] rounded-none border-t border-border" /></div>
      </div>
    </PageContainer>
  );
}
