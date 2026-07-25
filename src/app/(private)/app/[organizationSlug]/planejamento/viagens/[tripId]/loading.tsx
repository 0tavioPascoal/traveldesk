import { PageContainer } from "@/components/page/page-container";
import { Skeleton } from "@/components/ui/skeleton";

export default function TripDetailsLoading() {
  return (
    <PageContainer className="space-y-6">
      <div aria-busy="true" aria-label="Carregando detalhes da viagem" className="space-y-6">
        <Skeleton className="h-4 w-64" />
        <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
          <Skeleton className="h-3 w-36" />
          <Skeleton className="mt-3 h-8 w-[34rem] max-w-full" />
          <Skeleton className="mt-3 h-4 w-[28rem] max-w-full" />
          <div className="mt-5 flex gap-2"><Skeleton className="h-7 w-24" /><Skeleton className="h-7 w-20" /></div>
          <div className="mt-6 flex gap-3 sm:justify-end"><Skeleton className="h-11 flex-1 sm:w-44 sm:flex-none" /><Skeleton className="h-11 w-12" /></div>
        </div>
        <div className="grid overflow-hidden rounded-xl border border-border sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 9 }, (_, index) => <div key={index} className="flex gap-3 border-b border-border p-4"><Skeleton className="size-9 shrink-0" /><div className="w-full space-y-2"><Skeleton className="h-3 w-20" /><Skeleton className="h-4 w-4/5" /></div></div>)}
        </div>
        <Skeleton className="h-12 w-full" />
        <div className="grid gap-4 lg:grid-cols-2"><Skeleton className="h-64" /><Skeleton className="h-64" /></div>
      </div>
    </PageContainer>
  );
}
