import { Skeleton } from "@/components/ui/skeleton";

export function TripFormSkeleton() {
  return (
    <div aria-busy="true" aria-label="Carregando formulário da viagem" className="grid items-start gap-6 lg:grid-cols-[13rem_minmax(0,1fr)]">
      <div className="hidden space-y-3 lg:block"><Skeleton className="h-3 w-24" />{Array.from({ length: 6 }, (_, index) => <Skeleton key={index} className="h-9 w-full" />)}</div>
      <div className="space-y-6">
        {Array.from({ length: 4 }, (_, section) => (
          <div key={section} className="rounded-2xl border border-border bg-card p-5 sm:p-6">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="mt-2 h-4 w-[30rem] max-w-full" />
            <div className="mt-5 grid gap-5 sm:grid-cols-2"><Skeleton className="h-20" /><Skeleton className="h-20" /><Skeleton className="h-20 sm:col-span-2" /></div>
          </div>
        ))}
        <Skeleton className="h-24 w-full" />
      </div>
    </div>
  );
}
