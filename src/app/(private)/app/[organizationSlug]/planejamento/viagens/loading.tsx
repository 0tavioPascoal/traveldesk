import { PageContainer } from "@/components/page/page-container";
import { Skeleton } from "@/components/ui/skeleton";

export default function TripsLoading() {
  return (
    <PageContainer className="space-y-6">
      <div aria-busy="true" aria-label="Carregando viagens" className="space-y-6">
        <div className="space-y-3">
          <Skeleton className="h-4 w-40" />
          <div className="flex items-end justify-between gap-4"><div className="space-y-3"><Skeleton className="h-8 w-56" /><Skeleton className="h-4 w-[32rem] max-w-full" /></div><Skeleton className="hidden h-11 w-36 sm:block" /></div>
        </div>
        <div className="space-y-4 rounded-xl border border-border bg-card p-5"><Skeleton className="h-10 w-full" /><div className="grid gap-4 md:grid-cols-4">{Array.from({ length: 4 }, (_, index) => <Skeleton key={index} className="h-10" />)}</div></div>
        <Skeleton className="h-4 w-36" />
        <div className="hidden overflow-hidden rounded-xl border border-border xl:block"><Skeleton className="h-12 rounded-none" />{Array.from({ length: 5 }, (_, index) => <Skeleton key={index} className="h-20 rounded-none border-t border-border" />)}</div>
        <div className="space-y-3 xl:hidden">{Array.from({ length: 4 }, (_, index) => <Skeleton key={index} className="h-52" />)}</div>
      </div>
    </PageContainer>
  );
}
