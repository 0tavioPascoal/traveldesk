import { PageContainer } from "@/components/page/page-container";
import { Skeleton } from "@/components/ui/skeleton";

export function CatalogListSkeleton() {
  return (
    <PageContainer className="max-w-6xl space-y-6" >
      <div className="space-y-4">
        <Skeleton className="h-4 w-56" />
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-5 w-full max-w-2xl" />
      </div>
      <section className="rounded-2xl border border-border bg-card p-5">
        <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_12rem_auto]">
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
          <Skeleton className="h-10 self-end" />
        </div>
      </section>
      <section className="overflow-hidden rounded-2xl border border-border bg-card">
        <Skeleton className="h-12 rounded-none" />
        {Array.from({ length: 5 }).map((_, index) => <Skeleton key={index} className="h-16 rounded-none border-t border-border" />)}
      </section>
    </PageContainer>
  );
}

export function CatalogFormSkeleton() {
  return (
    <PageContainer className="max-w-3xl space-y-6">
      <div className="space-y-4">
        <Skeleton className="h-4 w-56" />
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-5 w-full max-w-xl" />
      </div>
      <section className="space-y-6 rounded-2xl border border-border bg-card p-5 sm:p-6">
        <Skeleton className="h-20" />
        <Skeleton className="h-40" />
        <Skeleton className="h-20" />
        <div className="flex justify-end gap-3"><Skeleton className="h-11 w-24" /><Skeleton className="h-11 w-36" /></div>
      </section>
    </PageContainer>
  );
}
