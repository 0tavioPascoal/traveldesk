import { PageContainer } from "@/components/page/page-container";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <PageContainer className="max-w-[96rem] space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-3">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-5 w-full max-w-2xl" />
        </div>
        <Skeleton className="h-10 w-full sm:w-96" />
      </div>
      <Skeleton className="h-8 w-full max-w-2xl" />
      <div className="grid grid-cols-12 gap-4">
        <Skeleton className="col-span-12 h-96 xl:col-span-8" />
        <Skeleton className="col-span-12 h-96 xl:col-span-4" />
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="col-span-12 h-80 xl:col-span-6" />
        ))}
      </div>
    </PageContainer>
  );
}
