import { PageContainer } from "@/components/page/page-container";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <PageContainer className="max-w-[96rem] space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-3">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-5 w-full max-w-2xl" />
        </div>
        <Skeleton className="h-10 w-full sm:w-80" />
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => <Skeleton key={index} className="h-32" />)}
      </div>
      <div className="grid gap-4 xl:grid-cols-12">
        <Skeleton className="h-80 xl:col-span-8" />
        <Skeleton className="h-80 xl:col-span-4" />
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-72 xl:col-span-4" />
        ))}
      </div>
    </PageContainer>
  );
}
